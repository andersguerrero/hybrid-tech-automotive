import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'
import { validateCartItems } from '@/lib/prices'
import { calculateSalesTax } from '@/lib/taxCalculator'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rateLimit'
import { stripeCheckoutSchema, formatZodError } from '@/lib/validations'
import { validateOrigin } from '@/lib/csrf'

export async function POST(request: NextRequest) {
  try {
    // CSRF: Verify request comes from our domain
    if (!validateOrigin(request)) {
      return NextResponse.json(
        { error: 'Invalid request origin' },
        { status: 403 }
      )
    }

    // Rate limiting: 10 requests per 15 minutes per IP
    const ip = getClientIP(request)
    const rateCheck = checkRateLimit(ip, RATE_LIMITS.stripeCheckout)
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many checkout requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)) } }
      )
    }

    const body = await request.json()

    // Zod validation
    const parsed = stripeCheckoutSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      )
    }

    const { items, customerEmail, bookingData, zipCode, lineItems: legacyLineItems, couponCode } = parsed.data

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'

    let finalLineItems: Array<{
      price_data: {
        currency: string
        product_data: { name: string; description?: string }
        unit_amount: number
      }
      quantity: number
    }> = []

    // New secure flow: validate prices server-side from item IDs
    if (items && items.length > 0) {
      const result = await validateCartItems(items)

      if ('error' in result) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        )
      }

      finalLineItems = result.lineItems

      // Apply coupon discount if provided
      if (couponCode) {
        const { blobGet } = await import('@/lib/storage')
        const coupons = await blobGet<Array<{ code: string; type: string; value: number; isActive: boolean; maxUses: number; usedCount: number; minPurchase: number; expiresAt: string | null }>>('config/coupons.json', 'coupons.json', [])
        const coupon = coupons.find(c => c.code === couponCode.toUpperCase().trim())

        if (coupon && coupon.isActive) {
          const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date()
          const isExhausted = coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses
          const meetsMinimum = coupon.minPurchase <= 0 || result.subtotal >= coupon.minPurchase

          if (!isExpired && !isExhausted && meetsMinimum) {
            let discount = 0
            if (coupon.type === 'percentage') {
              discount = (result.subtotal * coupon.value) / 100
            } else {
              discount = Math.min(coupon.value, result.subtotal)
            }

            if (discount > 0) {
              finalLineItems.push({
                price_data: {
                  currency: 'usd',
                  product_data: {
                    name: 'Discount',
                    description: `Coupon ${coupon.code} (${coupon.type === 'percentage' ? coupon.value + '%' : '$' + coupon.value} off)`,
                  },
                  unit_amount: -Math.round(discount * 100),
                },
                quantity: 1,
              })

              // Increment usage count (fire-and-forget)
              const { blobPut } = await import('@/lib/storage')
              const updatedCoupons = coupons.map(c =>
                c.code === coupon.code ? { ...c, usedCount: c.usedCount + 1 } : c
              )
              blobPut('config/coupons.json', 'coupons.json', updatedCoupons).catch(() => {})
            }
          }
        }
      }

      // Calculate tax server-side
      if (zipCode) {
        const { taxAmount, rate, state } = calculateSalesTax(zipCode, result.subtotal)
        if (taxAmount > 0) {
          finalLineItems.push({
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Sales Tax',
                description: `${state} sales tax (${(rate * 100).toFixed(2)}%)`,
              },
              unit_amount: Math.round(taxAmount * 100),
            },
            quantity: 1,
          })
        }
      }
    } else if (legacyLineItems && legacyLineItems.length > 0) {
      // Legacy support: accept pre-built lineItems (deprecated)
      console.warn('DEPRECATED: Checkout using client-side lineItems. Migrate to item IDs.')
      finalLineItems = legacyLineItems
    }

    // Store booking data in metadata for webhook processing
    const metadata: Record<string, string> = {}
    if (bookingData) {
      metadata.bookingData = JSON.stringify(bookingData)
    }

    const result = await createCheckoutSession(
      finalLineItems,
      `${baseUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      `${baseUrl}/checkout?canceled=true`,
      customerEmail,
      metadata
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      sessionId: result.sessionId,
      url: result.url,
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

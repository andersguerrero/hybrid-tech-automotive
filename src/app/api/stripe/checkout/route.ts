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

    const { items, customerEmail, bookingData, zipCode, lineItems: legacyLineItems } = parsed.data

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

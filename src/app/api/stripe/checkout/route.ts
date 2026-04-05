import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'
import { validateCartItems } from '@/lib/prices'
import { calculateSalesTax } from '@/lib/taxCalculator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, customerEmail, bookingData, zipCode, lineItems: legacyLineItems } = body

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'

    let finalLineItems = []

    // New secure flow: validate prices server-side from item IDs
    if (items && Array.isArray(items) && items.length > 0) {
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
    } else if (legacyLineItems && Array.isArray(legacyLineItems) && legacyLineItems.length > 0) {
      // Legacy support: accept pre-built lineItems (deprecated)
      console.warn('DEPRECATED: Checkout using client-side lineItems. Migrate to item IDs.')
      for (const item of legacyLineItems) {
        if (!item.price_data || !item.price_data.unit_amount || !item.quantity) {
          return NextResponse.json(
            { error: 'Invalid line items format' },
            { status: 400 }
          )
        }
        if (item.price_data.unit_amount <= 0 || item.price_data.unit_amount > 10000000) {
          return NextResponse.json(
            { error: 'Invalid price amount in line items' },
            { status: 400 }
          )
        }
      }
      finalLineItems = legacyLineItems
    } else {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      )
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

import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { serviceName, servicePrice, customerEmail, bookingData, lineItems } = body

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    let finalLineItems = []

    // If lineItems is provided (from cart), use it
    if (lineItems && Array.isArray(lineItems) && lineItems.length > 0) {
      // Validate all line items
      for (const item of lineItems) {
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
      finalLineItems = lineItems
    } else if (serviceName && servicePrice) {
      // Legacy support: single service
      if (servicePrice <= 0 || servicePrice > 100000) {
        return NextResponse.json(
          { error: 'Invalid price amount' },
          { status: 400 }
        )
      }
      
      finalLineItems = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: serviceName,
              description: `Service appointment for ${serviceName}`,
            },
            unit_amount: Math.round(servicePrice * 100), // Convert to cents, ensure integer
          },
          quantity: 1,
        },
      ]
    } else {
      return NextResponse.json(
        { error: 'Either lineItems or serviceName and servicePrice are required' },
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

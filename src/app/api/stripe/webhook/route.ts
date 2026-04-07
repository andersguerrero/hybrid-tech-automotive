import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { sendBookingEmails, sendOrderConfirmation } from '@/lib/email'
import { createOrder } from '@/lib/orders'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Disable body parsing for webhook verification
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // Retrieve booking data from metadata
      const bookingDataString = session.metadata?.bookingData

      if (!bookingDataString) {
        console.error('No booking data found in session metadata')
        return NextResponse.json(
          { error: 'No booking data found' },
          { status: 400 }
        )
      }

      let bookingData
      try {
        bookingData = JSON.parse(bookingDataString)
      } catch (parseError) {
        console.error('Error parsing booking data:', parseError)
        return NextResponse.json(
          { error: 'Invalid booking data format' },
          { status: 400 }
        )
      }

      // Validate required booking fields
      // Support both single service (legacy) and cart items (new)
      const hasService = bookingData.service && !bookingData.cartItems
      const hasCartItems = bookingData.cartItems && Array.isArray(bookingData.cartItems) && bookingData.cartItems.length > 0

      if (!bookingData.name || !bookingData.email || !bookingData.date || !bookingData.time) {
        console.error('Missing required booking fields')
        return NextResponse.json(
          { error: 'Missing required booking fields' },
          { status: 400 }
        )
      }

      if (!hasService && !hasCartItems) {
        console.error('No service or cart items found')
        return NextResponse.json(
          { error: 'No service or cart items found' },
          { status: 400 }
        )
      }

      // Prepare service description for email
      let serviceDescription = ''
      if (hasCartItems) {
        serviceDescription = bookingData.cartItems.map((item: any) =>
          `${item.name} (x${item.quantity})`
        ).join(', ')
      } else {
        serviceDescription = bookingData.service
      }

      // Persist order with payment confirmed
      const orderItems = hasCartItems
        ? bookingData.cartItems.map((item: any) => ({
            id: item.id || item.name,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1,
            type: item.type || 'service',
          }))
        : [{ id: 'booking', name: bookingData.service, price: (session.amount_total || 0) / 100, quantity: 1, type: 'service' as const }]

      const order = await createOrder({
        customerName: bookingData.name,
        customerEmail: bookingData.email,
        customerPhone: bookingData.phone || '',
        items: orderItems,
        subtotal: bookingData.subtotal || (session.amount_total || 0) / 100,
        tax: bookingData.tax || 0,
        total: bookingData.total || (session.amount_total || 0) / 100,
        paymentMethod: 'stripe',
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
        date: bookingData.date,
        time: bookingData.time,
        comments: bookingData.comments || '',
        stripeSessionId: session.id,
      })

      // Send booking confirmation + business notification (non-blocking)
      sendBookingEmails({
        customerName: bookingData.name,
        customerEmail: bookingData.email,
        customerPhone: bookingData.phone || '',
        service: serviceDescription,
        date: bookingData.date,
        time: bookingData.time,
        comments: bookingData.comments || '',
        subtotal: bookingData.subtotal,
        tax: bookingData.tax,
        total: bookingData.total || (session.amount_total || 0) / 100,
        paymentMethod: 'stripe',
      }).catch((err) => console.error('[Stripe Webhook] Booking email error:', err))

      // Send order confirmation email (non-blocking)
      sendOrderConfirmation({
        customerEmail: bookingData.email,
        customerName: bookingData.name,
        orderId: order.id,
        items: orderItems.map((item: any) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal: bookingData.subtotal || (session.amount_total || 0) / 100,
        tax: bookingData.tax || 0,
        total: bookingData.total || (session.amount_total || 0) / 100,
        paymentMethod: 'stripe',
        date: bookingData.date,
        time: bookingData.time,
      }).catch((err) => console.error('[Stripe Webhook] Order confirmation email error:', err))

      console.log('Booking confirmed and emails queued:', {
        sessionId: session.id,
        customerEmail: bookingData.email,
        amount: session.amount_total,
      })

      return NextResponse.json({
        success: true,
        message: 'Booking confirmed',
      })
    }

    // Handle payment_intent.succeeded (alternative event)
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('Payment succeeded:', paymentIntent.id)
    }

    // Handle payment_intent.payment_failed
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('Payment failed:', paymentIntent.id)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function createPaymentIntent(amount: number, currency: string = 'usd') {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
    }
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return {
      success: false,
      error: 'Failed to create payment intent',
    }
  }
}

export async function createCheckoutSession(
  lineItems: Array<{
    price_data: {
      currency: string
      product_data: {
        name: string
        description?: string
      }
      unit_amount: number
    }
    quantity: number
  }>,
  successUrl: string,
  cancelUrl: string,
  customerEmail?: string,
  metadata?: Record<string, string>
) {
  try {
    const sessionConfig: any = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    }

    if (customerEmail) {
      sessionConfig.customer_email = customerEmail
    }

    if (metadata && Object.keys(metadata).length > 0) {
      sessionConfig.metadata = metadata
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return {
      success: true,
      sessionId: session.id,
      url: session.url,
    }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return {
      success: false,
      error: 'Failed to create checkout session',
    }
  }
}

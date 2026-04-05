import { NextRequest, NextResponse } from 'next/server'
import { sendBookingConfirmation, sendAdminNewOrderNotification } from '@/lib/email'
import { createOrder } from '@/lib/orders'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rateLimit'
import { bookingFormSchema, formatZodError } from '@/lib/validations'
import { sanitizeName, sanitizeEmail, sanitizePhone, sanitizeText, sanitizeMessage } from '@/lib/sanitize'
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

    // Rate limiting: 5 requests per 15 minutes per IP
    const ip = getClientIP(request)
    const rateCheck = checkRateLimit(ip, RATE_LIMITS.booking)
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many booking requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)) } }
      )
    }

    const body = await request.json()

    // Zod validation
    const parsed = bookingFormSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const name = sanitizeName(parsed.data.name)
    const email = sanitizeEmail(parsed.data.email)
    const phone = sanitizePhone(parsed.data.phone)
    const service = parsed.data.service ? sanitizeText(parsed.data.service, 500) : undefined
    const date = sanitizeText(parsed.data.date, 20)
    const time = sanitizeText(parsed.data.time, 20)
    const comments = sanitizeMessage(parsed.data.comments || '')
    const paymentMethod = parsed.data.paymentMethod
    const cartItems = parsed.data.cartItems
    const subtotal = parsed.data.subtotal
    const tax = parsed.data.tax
    const total = parsed.data.total

    // Build service description from cart items or single service
    let serviceDescription = service
    if (cartItems && cartItems.length > 0) {
      serviceDescription = cartItems.map((item) =>
        `${item.quantity}x ${sanitizeText(item.name, 200)} - $${(item.price * item.quantity).toFixed(2)}`
      ).join(', ')
    }

    // Prepare booking data for email
    const bookingData = {
      service: serviceDescription || 'Service',
      date,
      time,
      comments,
      subtotal,
      tax,
      total,
      paymentMethod,
    }

    // Send confirmation email to customer
    const emailResult = await sendBookingConfirmation(email, name, bookingData)

    if (!emailResult.success) {
      console.error('Failed to send confirmation email:', emailResult.error)
      const errorMsg = process.env.NODE_ENV === 'production'
        ? 'No se pudo enviar el correo de confirmaci\u00f3n. Intenta nuevamente o cont\u00e1ctanos.'
        : `SMTP error: ${(emailResult.error as Error)?.message || emailResult.error || 'Unknown error'}`
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 500 }
      )
    }

    // Persist order
    const orderItems = cartItems && cartItems.length > 0
      ? cartItems.map((item) => ({
          id: item.id || sanitizeText(item.name, 200),
          name: sanitizeText(item.name, 200),
          price: item.price,
          quantity: item.quantity || 1,
          type: item.type || 'service' as const,
        }))
      : [{ id: service || 'booking', name: service || 'Service', price: total || 0, quantity: 1, type: 'service' as const }]

    const order = await createOrder({
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      items: orderItems,
      subtotal: subtotal || total || 0,
      tax: tax || 0,
      total: total || subtotal || 0,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: 'pending',
      orderStatus: 'pending',
      date,
      time,
      comments,
    })

    // Send admin notification (fire-and-forget, don't block response)
    sendAdminNewOrderNotification({
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      items: orderItems.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
      total: total || subtotal || 0,
      paymentMethod: paymentMethod || 'cash',
      date,
      time,
      orderId: order.id,
    }).catch(err => console.error('Admin notification failed:', err))

    return NextResponse.json({
      success: true,
      message: 'Appointment booked successfully! You will receive a confirmation email shortly.'
    })

  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json(
      { error: 'Failed to book appointment' },
      { status: 500 }
    )
  }
}

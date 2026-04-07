import { NextRequest, NextResponse } from 'next/server'
import { sendBookingEmails } from '@/lib/email'
import { createOrder } from '@/lib/orders'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, service, date, time, comments, paymentMethod, cartItems, subtotal, tax, total } = body

    // Validate required fields
    if (!name || !email || !phone || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Build service description from cart items or single service
    let serviceDescription = service
    if (cartItems && cartItems.length > 0) {
      serviceDescription = cartItems.map((item: any) =>
        `${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`
      ).join(', ')
    }

    // Persist order
    const orderItems = cartItems && cartItems.length > 0
      ? cartItems.map((item: any) => ({
          id: item.id || item.name,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          type: item.type || 'service',
        }))
      : [{ id: service || 'booking', name: service || 'Service', price: total || 0, quantity: 1, type: 'service' as const }]

    await createOrder({
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
      comments: comments || '',
    })

    // Send emails (non-blocking: fires in background, never fails the response)
    sendBookingEmails({
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      service: serviceDescription,
      date,
      time,
      comments: comments || '',
      subtotal,
      tax,
      total,
      paymentMethod,
    }).catch((err) => console.error('[Booking] Email send error:', err))

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

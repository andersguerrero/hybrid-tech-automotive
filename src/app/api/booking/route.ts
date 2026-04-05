import { NextRequest, NextResponse } from 'next/server'
import { sendBookingConfirmation } from '@/lib/email'
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

    // Prepare booking data for email
    const bookingData: any = {
      service: serviceDescription,
      date,
      time,
      comments: comments || ''
    }

    // Add cart totals if available
    if (subtotal !== undefined) {
      bookingData.subtotal = subtotal
    }
    if (tax !== undefined) {
      bookingData.tax = tax
    }
    if (total !== undefined) {
      bookingData.total = total
    }
    if (paymentMethod) {
      bookingData.paymentMethod = paymentMethod
    }

    // Send confirmation email to customer
    const emailResult = await sendBookingConfirmation(email, name, bookingData)

    if (!emailResult.success) {
      console.error('Failed to send confirmation email:', emailResult.error)
      const errorMsg = process.env.NODE_ENV === 'production'
        ? 'No se pudo enviar el correo de confirmación. Intenta nuevamente o contáctanos.'
        : `SMTP error: ${(emailResult.error as Error)?.message || emailResult.error || 'Unknown error'}`
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 500 }
      )
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

import { NextRequest, NextResponse } from 'next/server'
import { sendContactForm } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Send contact form to business + acknowledgment to customer (non-blocking)
    sendContactForm({
      name,
      email,
      phone: phone || '',
      subject,
      message,
    }).catch((err) => console.error('[Contact] Email send error:', err))

    return NextResponse.json({
      success: true,
      message: 'Mensaje enviado correctamente. Te contactaremos dentro de 24 horas.'
    })

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al procesar el mensaje. Por favor, llamanos al (832) 762-5299.' },
      { status: 500 }
    )
  }
}

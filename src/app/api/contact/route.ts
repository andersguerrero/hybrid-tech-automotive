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

    // Check if email configuration is available
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.BUSINESS_EMAIL) {
      console.log('Email configuration not available, logging contact form data:')
      console.log('Contact Form Data:', { name, email, phone, subject, message })
      
      return NextResponse.json({
        success: true,
        message: 'Mensaje recibido correctamente. Te contactaremos pronto al (123) 456-7890.'
      })
    }

    // Send contact form to business email
    const emailResult = await sendContactForm({
      name,
      email,
      phone: phone || '',
      subject,
      message
    })

    if (!emailResult.success) {
      console.error('Failed to send contact form:', emailResult.error)
      const errorMsg = process.env.NODE_ENV === 'production'
        ? 'No se pudo enviar el correo. Intenta nuevamente o llámanos al (123) 456-7890.'
        : `SMTP error: ${(emailResult.error as Error)?.message || emailResult.error || 'Unknown error'}`
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Mensaje enviado correctamente. Te contactaremos dentro de 24 horas.'
    })

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al procesar el mensaje. Por favor, llámanos al (123) 456-7890.' },
      { status: 500 }
    )
  }
}

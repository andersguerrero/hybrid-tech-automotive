import { NextRequest, NextResponse } from 'next/server'
import { sendContactForm } from '@/lib/email'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rateLimit'
import { contactFormSchema, formatZodError } from '@/lib/validations'
import { sanitizeName, sanitizeEmail, sanitizePhone, sanitizeText, sanitizeMessage } from '@/lib/sanitize'
import { validateOrigin } from '@/lib/csrf'
import logger from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    // CSRF: Verify request comes from our domain
    if (!validateOrigin(request)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request origin' },
        { status: 403 }
      )
    }

    // Rate limiting: 3 requests per 15 minutes per IP
    const ip = getClientIP(request)
    const rateCheck = checkRateLimit(ip, RATE_LIMITS.contactForm)
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: 'Demasiados mensajes enviados. Intenta de nuevo en unos minutos.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)) } }
      )
    }

    const body = await request.json()

    // Zod validation
    const parsed = contactFormSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: formatZodError(parsed.error) },
        { status: 400 }
      )
    }

    // Sanitize all inputs
    const name = sanitizeName(parsed.data.name)
    const email = sanitizeEmail(parsed.data.email)
    const phone = sanitizePhone(parsed.data.phone || '')
    const subject = sanitizeText(parsed.data.subject, 200)
    const message = sanitizeMessage(parsed.data.message)

    // Check if email configuration is available
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.BUSINESS_EMAIL) {
      logger.info('Email configuration not available, logging contact form data:')
      logger.info('Contact Form Data:', { name, email, phone, subject, message })

      return NextResponse.json({
        success: true,
        message: 'Mensaje recibido correctamente. Te contactaremos pronto al (123) 456-7890.'
      })
    }

    // Send contact form to business email
    const emailResult = await sendContactForm({
      name,
      email,
      phone,
      subject,
      message
    })

    if (!emailResult.success) {
      logger.error('Failed to send contact form:', emailResult.error as Error)
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
    logger.error('Contact form error:', error as Error)
    return NextResponse.json(
      { success: false, error: 'Error al procesar el mensaje. Por favor, llámanos al (123) 456-7890.' },
      { status: 500 }
    )
  }
}

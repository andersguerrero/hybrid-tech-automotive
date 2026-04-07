import { Resend } from 'resend'
import {
  bookingConfirmationSubject,
  bookingConfirmationHtml,
  bookingNotificationSubject,
  bookingNotificationHtml,
  contactAckSubject,
  contactAckHtml,
  contactNotificationSubject,
  contactNotificationHtml,
  orderConfirmationSubject,
  orderConfirmationHtml,
  orderStatusSubject,
  orderStatusHtml,
  newsletterWelcomeSubject,
  newsletterWelcomeHtml,
} from './email-templates'

// ── Resend client (lazy-initialised) ─────────────────────────

let _resend: Resend | null = null
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

// Resend free-tier uses onboarding@resend.dev; custom domains use FROM_EMAIL.
const FROM_EMAIL = process.env.FROM_EMAIL || 'Hybrid Tech Auto <onboarding@resend.dev>'
const BUSINESS_EMAIL = process.env.BUSINESS_EMAIL || 'info@hybridtechauto.com'

// ── Low-level send helper ────────────────────────────────────

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

export async function sendEmail({ to, subject, html, replyTo }: EmailOptions): Promise<{ success: boolean; error?: unknown }> {
  const resend = getResend()
  if (!resend) {
    console.log('[Email] No RESEND_API_KEY configured, skipping email:', subject)
    return { success: false, error: 'No API key configured' }
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    })
    console.log('[Email] Sent successfully:', subject)
    return { success: true, data } as { success: boolean; data?: unknown }
  } catch (error) {
    console.error('[Email] Failed to send:', subject, error)
    return { success: false, error }
  }
}

// ── Fire-and-forget helper (non-blocking) ────────────────────

function fireAndForget(promise: Promise<unknown>): void {
  promise.catch((err) => console.error('[Email] Background send error:', err))
}

// ── Type alias for locale ────────────────────────────────────

type Locale = 'en' | 'es'

// ============================================================
// Public API — Booking
// ============================================================

/**
 * Send booking confirmation to the customer AND a notification to the business.
 * This is a backward-compatible replacement for the old nodemailer version.
 * Email sending is non-blocking: failures are logged but never throw.
 */
export async function sendBookingConfirmation(
  customerEmail: string,
  customerName: string,
  appointmentDetails: {
    service: string
    date: string
    time: string
    comments?: string
    subtotal?: number
    tax?: number
    total?: number
    paymentMethod?: string
  },
  locale: Locale = 'en',
) {
  // 1. Customer confirmation email
  const customerResult = await sendEmail({
    to: customerEmail,
    subject: bookingConfirmationSubject(appointmentDetails.date, locale),
    html: bookingConfirmationHtml({
      customerName,
      service: appointmentDetails.service,
      date: appointmentDetails.date,
      time: appointmentDetails.time,
      comments: appointmentDetails.comments,
      subtotal: appointmentDetails.subtotal,
      tax: appointmentDetails.tax,
      total: appointmentDetails.total,
      paymentMethod: appointmentDetails.paymentMethod,
    }, locale),
  })

  // 2. Business notification (fire-and-forget so it never slows the response)
  fireAndForget(
    sendEmail({
      to: BUSINESS_EMAIL,
      subject: bookingNotificationSubject(customerName, appointmentDetails.date),
      html: bookingNotificationHtml({
        customerName,
        customerEmail,
        customerPhone: '', // phone is not available in this signature
        service: appointmentDetails.service,
        date: appointmentDetails.date,
        time: appointmentDetails.time,
        comments: appointmentDetails.comments,
        subtotal: appointmentDetails.subtotal,
        tax: appointmentDetails.tax,
        total: appointmentDetails.total,
        paymentMethod: appointmentDetails.paymentMethod,
      }),
      replyTo: customerEmail,
    }),
  )

  return customerResult
}

/**
 * Extended version of sendBookingConfirmation that also includes customer phone
 * for the business notification. Used when phone is available.
 */
export async function sendBookingEmails(
  data: {
    customerName: string
    customerEmail: string
    customerPhone: string
    service: string
    date: string
    time: string
    comments?: string
    subtotal?: number
    tax?: number
    total?: number
    paymentMethod?: string
  },
  locale: Locale = 'en',
) {
  const customerPromise = sendEmail({
    to: data.customerEmail,
    subject: bookingConfirmationSubject(data.date, locale),
    html: bookingConfirmationHtml({
      customerName: data.customerName,
      service: data.service,
      date: data.date,
      time: data.time,
      comments: data.comments,
      subtotal: data.subtotal,
      tax: data.tax,
      total: data.total,
      paymentMethod: data.paymentMethod,
    }, locale),
  })

  const businessPromise = sendEmail({
    to: BUSINESS_EMAIL,
    subject: bookingNotificationSubject(data.customerName, data.date),
    html: bookingNotificationHtml({
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      service: data.service,
      date: data.date,
      time: data.time,
      comments: data.comments,
      subtotal: data.subtotal,
      tax: data.tax,
      total: data.total,
      paymentMethod: data.paymentMethod,
    }),
    replyTo: data.customerEmail,
  })

  // Run both in parallel; neither should block the caller
  const [customerResult] = await Promise.all([customerPromise, businessPromise.catch(() => null)])
  return customerResult
}

// ============================================================
// Public API — Contact Form
// ============================================================

/**
 * Send the contact form to the business AND an acknowledgment to the customer.
 * Backward-compatible with the old nodemailer `sendContactForm` signature.
 */
export async function sendContactForm(
  formData: {
    name: string
    email: string
    phone: string
    subject: string
    message: string
  },
  locale: Locale = 'en',
) {
  // 1. Business notification
  const businessResult = await sendEmail({
    to: BUSINESS_EMAIL,
    subject: contactNotificationSubject(formData.name),
    html: contactNotificationHtml(formData),
    replyTo: formData.email,
  })

  // 2. Customer acknowledgment (fire-and-forget)
  fireAndForget(
    sendEmail({
      to: formData.email,
      subject: contactAckSubject(locale),
      html: contactAckHtml({ customerName: formData.name }, locale),
    }),
  )

  return businessResult
}

// ============================================================
// Public API — Order Confirmation
// ============================================================

export async function sendOrderConfirmation(
  data: {
    customerEmail: string
    customerName: string
    orderId: string
    items: Array<{ name: string; price: number; quantity: number }>
    subtotal: number
    tax: number
    total: number
    paymentMethod: string
    date: string
    time: string
  },
  locale: Locale = 'en',
) {
  return sendEmail({
    to: data.customerEmail,
    subject: orderConfirmationSubject(data.orderId, locale),
    html: orderConfirmationHtml(data, locale),
  })
}

// ============================================================
// Public API — Order Status Update
// ============================================================

export async function sendOrderStatusUpdate(
  data: {
    customerEmail: string
    customerName: string
    orderId: string
    newStatus: string
  },
  locale: Locale = 'en',
) {
  return sendEmail({
    to: data.customerEmail,
    subject: orderStatusSubject(data.orderId, data.newStatus, locale),
    html: orderStatusHtml(data, locale),
  })
}

// ============================================================
// Public API — Newsletter Welcome
// ============================================================

export async function sendNewsletterWelcome(email: string, locale: Locale = 'en') {
  return sendEmail({
    to: email,
    subject: newsletterWelcomeSubject(locale),
    html: newsletterWelcomeHtml({ email }, locale),
  })
}

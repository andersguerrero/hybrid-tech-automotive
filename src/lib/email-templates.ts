// ============================================================
// Transactional email HTML templates for Hybrid Tech Auto
// All styles are inline for maximum email-client compatibility.
// Each template accepts a `locale` parameter ('en' | 'es').
// ============================================================

const BRAND = {
  primary: '#1F2937',
  primaryDark: '#111827',
  secondary: '#10B981',
  name: 'Hybrid Tech Auto',
  legalName: 'Hybrid Tech Automotive LLC',
  address: '24422 Starview Landing Ct, Spring, TX 77373',
  phone: '(832) 762-5299',
  phoneTel: '+18327625299',
  email: 'info@hybridtechauto.com',
  whatsapp: 'https://wa.me/18327625299',
  website: 'https://hybridtechauto.com',
  logoUrl: 'https://hybridtechauto.com/logo.jpg',
} as const

type Locale = 'en' | 'es'

// ── Shared layout wrapper ────────────────────────────────────

function layout(bodyContent: string, locale: Locale = 'en'): string {
  const year = new Date().getFullYear()
  const rights = locale === 'es' ? 'Todos los derechos reservados' : 'All rights reserved'

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${BRAND.name}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e4e4e7;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND.primary},${BRAND.primaryDark});padding:24px;text-align:center;">
              <img src="${BRAND.logoUrl}" alt="${BRAND.name}" width="180" style="max-width:180px;height:auto;display:inline-block;background:#ffffff;border-radius:8px;padding:8px;" />
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 24px;">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:24px;border-top:1px solid #e4e4e7;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:center;color:#71717a;font-size:13px;line-height:20px;">
                    <p style="margin:0 0 4px;">${BRAND.legalName}</p>
                    <p style="margin:0 0 4px;">${BRAND.address}</p>
                    <p style="margin:0 0 12px;">
                      <a href="tel:${BRAND.phoneTel}" style="color:${BRAND.primary};text-decoration:none;">${BRAND.phone}</a>
                      &nbsp;&bull;&nbsp;
                      <a href="mailto:${BRAND.email}" style="color:${BRAND.primary};text-decoration:none;">${BRAND.email}</a>
                    </p>
                    <p style="margin:0;font-size:12px;color:#a1a1aa;">&copy; ${year} ${BRAND.name}. ${rights}.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ── Shared helpers ───────────────────────────────────────────

function ctaButton(label: string, href: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
      <tr>
        <td style="background-color:${BRAND.primary};border-radius:6px;">
          <a href="${href}" target="_blank" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;border-radius:6px;">${label}</a>
        </td>
      </tr>
    </table>`
}

function detailRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:8px 12px;font-weight:bold;color:#374151;font-size:14px;border-bottom:1px solid #f3f4f6;width:140px;vertical-align:top;">${label}</td>
      <td style="padding:8px 12px;color:#4b5563;font-size:14px;border-bottom:1px solid #f3f4f6;vertical-align:top;">${value}</td>
    </tr>`
}

function detailsTable(rows: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;overflow:hidden;margin:16px 0;">
      ${rows}
    </table>`
}

// ============================================================
// 1. Booking Confirmation (to customer)
// ============================================================

interface BookingConfirmationData {
  customerName: string
  service: string
  date: string
  time: string
  comments?: string
  subtotal?: number
  tax?: number
  total?: number
  paymentMethod?: string
}

export function bookingConfirmationSubject(date: string, locale: Locale = 'en'): string {
  return locale === 'es'
    ? `Tu cita en Hybrid Tech Auto - ${date}`
    : `Your Appointment at Hybrid Tech Auto - ${date}`
}

export function bookingConfirmationHtml(data: BookingConfirmationData, locale: Locale = 'en'): string {
  const isEs = locale === 'es'

  const paymentLabels: Record<string, Record<string, string>> = {
    en: { stripe: 'Credit Card (Paid)', zelle: 'Zelle (To be paid)', cash: 'Cash (Pay in person)' },
    es: { stripe: 'Tarjeta de credito (Pagado)', zelle: 'Zelle (Por pagar)', cash: 'Efectivo (Pagar en persona)' },
  }

  const paymentDisplay = data.paymentMethod
    ? (paymentLabels[locale]?.[data.paymentMethod] || data.paymentMethod)
    : ''

  const greeting = isEs ? `Hola ${data.customerName},` : `Dear ${data.customerName},`
  const intro = isEs
    ? 'Gracias por agendar tu cita con Hybrid Tech Auto. Aqui estan los detalles de tu cita:'
    : 'Thank you for booking your appointment with Hybrid Tech Auto. Here are your appointment details:'

  const serviceLabel = isEs ? 'Servicio' : 'Service'
  const dateLabel = isEs ? 'Fecha' : 'Date'
  const timeLabel = isEs ? 'Hora' : 'Time'
  const commentsLabel = isEs ? 'Comentarios' : 'Comments'
  const subtotalLabel = 'Subtotal'
  const taxLabel = isEs ? 'Impuestos' : 'Tax'
  const totalLabel = 'Total'
  const paymentLabel = isEs ? 'Metodo de pago' : 'Payment Method'

  let rows = ''
  rows += detailRow(serviceLabel, data.service)
  rows += detailRow(dateLabel, data.date)
  rows += detailRow(timeLabel, data.time)
  if (data.comments) rows += detailRow(commentsLabel, data.comments)

  let orderSummary = ''
  if (data.total !== undefined) {
    let oRows = ''
    if (data.subtotal !== undefined) oRows += detailRow(subtotalLabel, `$${data.subtotal.toFixed(2)}`)
    if (data.tax !== undefined && data.tax > 0) oRows += detailRow(taxLabel, `$${data.tax.toFixed(2)}`)
    oRows += detailRow(totalLabel, `$${data.total.toFixed(2)}`)
    if (paymentDisplay) oRows += detailRow(paymentLabel, paymentDisplay)
    orderSummary = `
      <p style="margin:24px 0 8px;font-size:16px;font-weight:bold;color:#111827;">${isEs ? 'Resumen del pedido' : 'Order Summary'}</p>
      ${detailsTable(oRows)}`
  }

  const rescheduleText = isEs
    ? `Si necesitas reprogramar o tienes alguna pregunta, llamanos al <a href="tel:${BRAND.phoneTel}" style="color:${BRAND.primary};text-decoration:none;">${BRAND.phone}</a>.`
    : `Need to reschedule or have questions? Call us at <a href="tel:${BRAND.phoneTel}" style="color:${BRAND.primary};text-decoration:none;">${BRAND.phone}</a>.`

  const closing = isEs ? 'Esperamos atenderte pronto.' : 'We look forward to serving you!'

  const whatsappLabel = isEs ? 'Chatea por WhatsApp' : 'Chat on WhatsApp'

  const body = `
    <p style="margin:0 0 8px;font-size:20px;font-weight:bold;color:${BRAND.primary};">${isEs ? 'Cita Confirmada!' : 'Appointment Confirmed!'}</p>
    <p style="margin:0 0 4px;font-size:15px;color:#374151;">${greeting}</p>
    <p style="margin:0 0 16px;font-size:15px;color:#4b5563;">${intro}</p>
    ${detailsTable(rows)}
    ${orderSummary}
    <p style="margin:16px 0 8px;font-size:14px;color:#4b5563;">${rescheduleText}</p>
    ${ctaButton(whatsappLabel, BRAND.whatsapp)}
    <p style="margin:0;font-size:14px;color:#4b5563;">${closing}</p>`

  return layout(body, locale)
}

// ============================================================
// 2. Booking Notification (to business)
// ============================================================

interface BookingNotificationData {
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
}

export function bookingNotificationSubject(customerName: string, date: string): string {
  return `New Booking - ${customerName} - ${date}`
}

export function bookingNotificationHtml(data: BookingNotificationData): string {
  let rows = ''
  rows += detailRow('Customer', data.customerName)
  rows += detailRow('Email', `<a href="mailto:${data.customerEmail}" style="color:${BRAND.primary};text-decoration:none;">${data.customerEmail}</a>`)
  rows += detailRow('Phone', `<a href="tel:${data.customerPhone}" style="color:${BRAND.primary};text-decoration:none;">${data.customerPhone}</a>`)
  rows += detailRow('Service', data.service)
  rows += detailRow('Date', data.date)
  rows += detailRow('Time', data.time)
  if (data.comments) rows += detailRow('Comments', data.comments)
  if (data.paymentMethod) rows += detailRow('Payment', data.paymentMethod)
  if (data.total !== undefined) rows += detailRow('Total', `$${data.total.toFixed(2)}`)

  const body = `
    <p style="margin:0 0 16px;font-size:20px;font-weight:bold;color:${BRAND.primary};">New Booking Received</p>
    ${detailsTable(rows)}`

  return layout(body, 'en')
}

// ============================================================
// 3. Order Confirmation (to customer)
// ============================================================

interface OrderConfirmationData {
  customerName: string
  orderId: string
  items: Array<{ name: string; price: number; quantity: number }>
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  date: string
  time: string
}

export function orderConfirmationSubject(orderId: string, locale: Locale = 'en'): string {
  return locale === 'es'
    ? `Confirmacion de pedido ${orderId} - Hybrid Tech Auto`
    : `Order Confirmation ${orderId} - Hybrid Tech Auto`
}

export function orderConfirmationHtml(data: OrderConfirmationData, locale: Locale = 'en'): string {
  const isEs = locale === 'es'

  const paymentLabels: Record<string, Record<string, string>> = {
    en: { stripe: 'Credit Card', zelle: 'Zelle', cash: 'Cash' },
    es: { stripe: 'Tarjeta de credito', zelle: 'Zelle', cash: 'Efectivo' },
  }
  const paymentDisplay = paymentLabels[locale]?.[data.paymentMethod] || data.paymentMethod

  const greeting = isEs ? `Hola ${data.customerName},` : `Dear ${data.customerName},`
  const intro = isEs
    ? 'Tu pedido ha sido confirmado. Aqui esta el resumen:'
    : 'Your order has been confirmed. Here is your summary:'

  // Items table
  let itemsHtml = ''
  for (const item of data.items) {
    itemsHtml += `
      <tr>
        <td style="padding:8px 12px;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6;">${item.name}</td>
        <td style="padding:8px 12px;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6;text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
  }

  const itemLabel = isEs ? 'Articulo' : 'Item'
  const qtyLabel = isEs ? 'Cant.' : 'Qty'

  const itemsTable = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;overflow:hidden;margin:16px 0;">
      <tr style="background-color:#e5e7eb;">
        <td style="padding:8px 12px;font-weight:bold;font-size:13px;color:#374151;">${itemLabel}</td>
        <td style="padding:8px 12px;font-weight:bold;font-size:13px;color:#374151;text-align:center;">${qtyLabel}</td>
        <td style="padding:8px 12px;font-weight:bold;font-size:13px;color:#374151;text-align:right;">Total</td>
      </tr>
      ${itemsHtml}
    </table>`

  let summaryRows = ''
  summaryRows += detailRow('Subtotal', `$${data.subtotal.toFixed(2)}`)
  if (data.tax > 0) summaryRows += detailRow(isEs ? 'Impuestos' : 'Tax', `$${data.tax.toFixed(2)}`)
  summaryRows += detailRow('Total', `<strong>$${data.total.toFixed(2)}</strong>`)
  summaryRows += detailRow(isEs ? 'Metodo de pago' : 'Payment', paymentDisplay)
  summaryRows += detailRow(isEs ? 'Fecha de cita' : 'Appointment Date', data.date)
  summaryRows += detailRow(isEs ? 'Hora' : 'Time', data.time)

  const questionsText = isEs
    ? `Si tienes alguna pregunta, contactanos al <a href="tel:${BRAND.phoneTel}" style="color:${BRAND.primary};text-decoration:none;">${BRAND.phone}</a>.`
    : `If you have any questions, contact us at <a href="tel:${BRAND.phoneTel}" style="color:${BRAND.primary};text-decoration:none;">${BRAND.phone}</a>.`

  const body = `
    <p style="margin:0 0 16px;font-size:20px;font-weight:bold;color:${BRAND.primary};">${isEs ? 'Pedido Confirmado' : 'Order Confirmed'}</p>
    <p style="margin:0 0 4px;font-size:15px;color:#374151;">${greeting}</p>
    <p style="margin:0 0 4px;font-size:15px;color:#4b5563;">${intro}</p>
    <p style="margin:8px 0 16px;font-size:13px;color:#71717a;">${isEs ? 'Pedido' : 'Order'}: <strong>${data.orderId}</strong></p>
    ${itemsTable}
    ${detailsTable(summaryRows)}
    <p style="margin:16px 0 0;font-size:14px;color:#4b5563;">${questionsText}</p>`

  return layout(body, locale)
}

// ============================================================
// 4. Contact Form Acknowledgment (to customer)
// ============================================================

interface ContactAckData {
  customerName: string
}

export function contactAckSubject(locale: Locale = 'en'): string {
  return locale === 'es'
    ? 'Recibimos tu mensaje - Hybrid Tech Auto'
    : 'We received your message - Hybrid Tech Auto'
}

export function contactAckHtml(data: ContactAckData, locale: Locale = 'en'): string {
  const isEs = locale === 'es'

  const greeting = isEs ? `Hola ${data.customerName},` : `Dear ${data.customerName},`
  const p1 = isEs
    ? 'Gracias por contactarnos. Hemos recibido tu mensaje y te responderemos dentro de las proximas 24 horas.'
    : 'Thank you for reaching out. We have received your message and will get back to you within 24 hours.'
  const p2 = isEs
    ? 'Si tu consulta es urgente, no dudes en llamarnos o escribirnos por WhatsApp:'
    : 'If your inquiry is urgent, feel free to call or message us on WhatsApp:'

  const callLabel = isEs ? 'Llamar ahora' : 'Call Us Now'
  const whatsappLabel = isEs ? 'WhatsApp' : 'WhatsApp'

  const body = `
    <p style="margin:0 0 16px;font-size:20px;font-weight:bold;color:${BRAND.primary};">${isEs ? 'Mensaje Recibido' : 'Message Received'}</p>
    <p style="margin:0 0 4px;font-size:15px;color:#374151;">${greeting}</p>
    <p style="margin:0 0 8px;font-size:15px;color:#4b5563;">${p1}</p>
    <p style="margin:0 0 16px;font-size:14px;color:#4b5563;">${p2}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
      <tr>
        <td style="padding-right:12px;">
          <a href="tel:${BRAND.phoneTel}" style="display:inline-block;padding:10px 20px;background-color:${BRAND.primary};color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;border-radius:6px;">${callLabel}</a>
        </td>
        <td>
          <a href="${BRAND.whatsapp}" target="_blank" style="display:inline-block;padding:10px 20px;background-color:#25D366;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;border-radius:6px;">${whatsappLabel}</a>
        </td>
      </tr>
    </table>`

  return layout(body, locale)
}

// ============================================================
// 5. Contact Form Notification (to business)
// ============================================================

interface ContactNotificationData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export function contactNotificationSubject(name: string): string {
  return `New Contact Form Submission - ${name}`
}

export function contactNotificationHtml(data: ContactNotificationData): string {
  let rows = ''
  rows += detailRow('Name', data.name)
  rows += detailRow('Email', `<a href="mailto:${data.email}" style="color:${BRAND.primary};text-decoration:none;">${data.email}</a>`)
  if (data.phone) rows += detailRow('Phone', `<a href="tel:${data.phone}" style="color:${BRAND.primary};text-decoration:none;">${data.phone}</a>`)
  rows += detailRow('Subject', data.subject)

  const body = `
    <p style="margin:0 0 16px;font-size:20px;font-weight:bold;color:${BRAND.primary};">New Contact Form Submission</p>
    ${detailsTable(rows)}
    <p style="margin:16px 0 8px;font-size:14px;font-weight:bold;color:#374151;">Message:</p>
    <div style="background-color:#f9fafb;padding:16px;border-radius:8px;margin:0 0 16px;">
      <p style="margin:0;font-size:14px;color:#4b5563;white-space:pre-wrap;">${data.message}</p>
    </div>
    <p style="margin:0;font-size:14px;color:#71717a;">Reply directly to <a href="mailto:${data.email}" style="color:${BRAND.primary};text-decoration:none;">${data.email}</a></p>`

  return layout(body, 'en')
}

// ============================================================
// 6. Order Status Update (to customer)
// ============================================================

interface OrderStatusData {
  customerName: string
  orderId: string
  newStatus: string
}

export function orderStatusSubject(orderId: string, status: string, locale: Locale = 'en'): string {
  const statusLabels: Record<string, Record<string, string>> = {
    en: { confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled', pending: 'Pending' },
    es: { confirmed: 'Confirmado', completed: 'Completado', cancelled: 'Cancelado', pending: 'Pendiente' },
  }
  const label = statusLabels[locale]?.[status] || status
  return locale === 'es'
    ? `Pedido ${orderId} - ${label} - Hybrid Tech Auto`
    : `Order ${orderId} - ${label} - Hybrid Tech Auto`
}

export function orderStatusHtml(data: OrderStatusData, locale: Locale = 'en'): string {
  const isEs = locale === 'es'

  const statusLabels: Record<string, Record<string, string>> = {
    en: { confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled', pending: 'Pending' },
    es: { confirmed: 'Confirmado', completed: 'Completado', cancelled: 'Cancelado', pending: 'Pendiente' },
  }
  const statusColors: Record<string, string> = {
    confirmed: '#16a34a',
    completed: '#0284c7',
    cancelled: '#dc2626',
    pending: '#d97706',
  }

  const statusLabel = statusLabels[locale]?.[data.newStatus] || data.newStatus
  const statusColor = statusColors[data.newStatus] || '#374151'

  const greeting = isEs ? `Hola ${data.customerName},` : `Dear ${data.customerName},`
  const updateMsg = isEs
    ? `El estado de tu pedido <strong>${data.orderId}</strong> ha sido actualizado:`
    : `Your order <strong>${data.orderId}</strong> status has been updated:`

  const questionsText = isEs
    ? `Si tienes alguna pregunta, contactanos al <a href="tel:${BRAND.phoneTel}" style="color:${BRAND.primary};text-decoration:none;">${BRAND.phone}</a>.`
    : `If you have any questions, contact us at <a href="tel:${BRAND.phoneTel}" style="color:${BRAND.primary};text-decoration:none;">${BRAND.phone}</a>.`

  const body = `
    <p style="margin:0 0 16px;font-size:20px;font-weight:bold;color:${BRAND.primary};">${isEs ? 'Actualizacion de Pedido' : 'Order Update'}</p>
    <p style="margin:0 0 4px;font-size:15px;color:#374151;">${greeting}</p>
    <p style="margin:0 0 16px;font-size:15px;color:#4b5563;">${updateMsg}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
      <tr>
        <td style="padding:12px 32px;background-color:#f9fafb;border-radius:8px;text-align:center;">
          <p style="margin:0 0 4px;font-size:13px;color:#71717a;">${isEs ? 'Nuevo estado' : 'New Status'}</p>
          <p style="margin:0;font-size:20px;font-weight:bold;color:${statusColor};">${statusLabel}</p>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:14px;color:#4b5563;">${questionsText}</p>`

  return layout(body, locale)
}

// ============================================================
// 7. Newsletter Welcome (to subscriber)
// ============================================================

interface NewsletterWelcomeData {
  email: string
}

export function newsletterWelcomeSubject(locale: Locale = 'en'): string {
  return locale === 'es'
    ? 'Bienvenido al boletin de Hybrid Tech Auto!'
    : 'Welcome to the Hybrid Tech Auto Newsletter!'
}

export function newsletterWelcomeHtml(data: NewsletterWelcomeData, locale: Locale = 'en'): string {
  const isEs = locale === 'es'

  const intro = isEs
    ? 'Gracias por suscribirte a nuestro boletin. Recibiras consejos sobre vehiculos hibridos, guias de mantenimiento y ofertas exclusivas.'
    : 'Thank you for subscribing to our newsletter. You will receive hybrid vehicle tips, maintenance guides, and exclusive offers.'

  const browseLabel = isEs ? 'Visitar nuestro sitio' : 'Visit Our Website'

  const unsubscribeText = isEs
    ? 'Si deseas cancelar tu suscripcion, haz clic aqui.'
    : 'If you wish to unsubscribe, click here.'

  const body = `
    <p style="margin:0 0 16px;font-size:20px;font-weight:bold;color:${BRAND.primary};">${isEs ? 'Bienvenido!' : 'Welcome!'}</p>
    <p style="margin:0 0 16px;font-size:15px;color:#4b5563;">${intro}</p>
    ${ctaButton(browseLabel, BRAND.website)}
    <p style="margin:24px 0 0;font-size:12px;color:#a1a1aa;text-align:center;">
      <a href="${BRAND.website}/unsubscribe?email=${encodeURIComponent(data.email)}" style="color:#a1a1aa;text-decoration:underline;">${unsubscribeText}</a>
    </p>`

  return layout(body, locale)
}

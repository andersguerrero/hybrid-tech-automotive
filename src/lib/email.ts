import nodemailer from 'nodemailer'

const smtpPort = parseInt(process.env.SMTP_PORT || '587')
const envSecure = (process.env.SMTP_SECURE || '').toLowerCase()
const smtpSecure = envSecure === 'true' || (envSecure === '' && smtpPort === 465)
const requireTLS = (process.env.SMTP_REQUIRE_TLS || '').toLowerCase() === 'true'
const ignoreTLS = (process.env.SMTP_IGNORE_TLS || '').toLowerCase() === 'true'
const authMethod = process.env.SMTP_AUTH_METHOD

function getMissingEnvVars(vars: string[]) {
  return vars.filter((v) => !process.env[v] || process.env[v] === '')
}

async function sendWithRetry(
  mailOptions: nodemailer.SendMailOptions,
  maxRetries = 3
): Promise<{ success: boolean; error?: unknown }> {
  const missing = getMissingEnvVars(['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'])
  if (missing.length) {
    return { success: false, error: new Error(`Missing SMTP vars: ${missing.join(', ')}`) }
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await transporter.sendMail(mailOptions)
      return { success: true }
    } catch (error) {
      console.error(`Email send attempt ${attempt}/${maxRetries} failed:`, error)
      if (attempt < maxRetries) {
        const delay = Math.pow(3, attempt - 1) * 1000 // 1s, 3s, 9s
        await new Promise((resolve) => setTimeout(resolve, delay))
      } else {
        return { success: false, error }
      }
    }
  }
  return { success: false, error: new Error('Max retries reached') }
}
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpSecure,
  requireTLS,
  ignoreTLS,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  ...(authMethod ? { authMethod } : {}),
})

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
  }
) {
  // Format payment method display name
  const paymentMethodNames: { [key: string]: string } = {
    'stripe': 'Credit Card (Paid)',
    'zelle': 'Zelle (To be paid)',
    'cash': 'Cash (Pay in person)'
  }
  const paymentDisplay = appointmentDetails.paymentMethod 
    ? paymentMethodNames[appointmentDetails.paymentMethod] || appointmentDetails.paymentMethod
    : ''

  const mailOptions = {
    from: process.env.BUSINESS_EMAIL || process.env.SMTP_USER,
    to: customerEmail,
    // Send a copy to the business so you receive the booking too
    bcc: process.env.BUSINESS_EMAIL,
    subject: 'Appointment Confirmation - Hybrid Tech Auto',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007BFF;">Appointment Confirmed!</h2>
        <p>Dear ${customerName},</p>
        <p>Thank you for booking an appointment with Hybrid Tech Auto. Here are your appointment details:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Appointment Details</h3>
          <p><strong>Service:</strong> ${appointmentDetails.service}</p>
          <p><strong>Date:</strong> ${appointmentDetails.date}</p>
          <p><strong>Time:</strong> ${appointmentDetails.time}</p>
          ${appointmentDetails.comments ? `<p><strong>Comments:</strong> ${appointmentDetails.comments}</p>` : ''}
        </div>

        ${appointmentDetails.total !== undefined ? `
        <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Order Summary</h3>
          ${appointmentDetails.subtotal !== undefined ? `<p><strong>Subtotal:</strong> $${appointmentDetails.subtotal.toFixed(2)}</p>` : ''}
          ${appointmentDetails.tax !== undefined && appointmentDetails.tax > 0 ? `<p><strong>Tax:</strong> $${appointmentDetails.tax.toFixed(2)}</p>` : ''}
          <p><strong>Total:</strong> $${appointmentDetails.total.toFixed(2)}</p>
          ${paymentDisplay ? `<p><strong>Payment Method:</strong> ${paymentDisplay}</p>` : ''}
        </div>
        ` : ''}
        
        <p>If you need to reschedule or have any questions, please call us at ${process.env.NEXT_PUBLIC_BUSINESS_PHONE || '(832) 762-5299'}.</p>
        
        <p>We look forward to serving you!</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 14px;">
          Hybrid Tech Automotive LLC<br>
          DBA: Hybrid Tech Auto<br>
          24422 Starview Landing Ct, Spring, TX 77373<br>
          ${process.env.NEXT_PUBLIC_BUSINESS_PHONE || '(832) 762-5299'}
        </p>
      </div>
    `,
  }

  return sendWithRetry(mailOptions)
}

/**
 * Send notification to admin when a new order/booking arrives
 */
export async function sendAdminNewOrderNotification(
  orderData: {
    customerName: string
    customerEmail: string
    customerPhone: string
    items: Array<{ name: string; quantity: number; price: number }>
    total: number
    paymentMethod: string
    date: string
    time: string
    orderId?: string
  }
) {
  const adminEmail = process.env.BUSINESS_EMAIL
  if (!adminEmail) {
    console.warn('BUSINESS_EMAIL not set, skipping admin notification')
    return { success: false, error: 'No admin email configured' }
  }

  const itemsList = orderData.items
    .map(item => `<tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`)
    .join('')

  const paymentLabels: Record<string, string> = {
    stripe: 'Credit Card (Paid)',
    zelle: 'Zelle (Pending)',
    cash: 'Cash (In-person)',
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hybridtechauto.com'

  const mailOptions = {
    from: adminEmail,
    to: adminEmail,
    subject: `New Order from ${orderData.customerName} - $${orderData.total.toFixed(2)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #007BFF; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">New Order Received!</h2>
          ${orderData.orderId ? `<p style="margin: 5px 0 0; opacity: 0.9; font-size: 14px;">${orderData.orderId}</p>` : ''}
        </div>

        <div style="border: 1px solid #ddd; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
          <h3 style="color: #333; margin-top: 0;">Customer Info</h3>
          <p><strong>Name:</strong> ${orderData.customerName}</p>
          <p><strong>Email:</strong> <a href="mailto:${orderData.customerEmail}">${orderData.customerEmail}</a></p>
          <p><strong>Phone:</strong> <a href="tel:${orderData.customerPhone}">${orderData.customerPhone}</a></p>

          <h3 style="color: #333;">Appointment</h3>
          <p><strong>Date:</strong> ${orderData.date}</p>
          <p><strong>Time:</strong> ${orderData.time}</p>
          <p><strong>Payment:</strong> ${paymentLabels[orderData.paymentMethod] || orderData.paymentMethod}</p>

          <h3 style="color: #333;">Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 8px; text-align: left;">Item</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 10px 8px; font-weight: bold; font-size: 16px;">Total</td>
                <td style="padding: 10px 8px; font-weight: bold; font-size: 16px; text-align: right; color: #007BFF;">$${orderData.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div style="text-align: center; margin-top: 20px;">
            <a href="${baseUrl}/admin/orders" style="background-color: #007BFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View in Admin Panel
            </a>
          </div>
        </div>
      </div>
    `,
  }

  return sendWithRetry(mailOptions)
}

export async function sendContactForm(
  formData: {
    name: string
    email: string
    phone: string
    subject: string
    message: string
  }
) {
  const mailOptions = {
    from: process.env.BUSINESS_EMAIL || process.env.SMTP_USER,
    to: process.env.BUSINESS_EMAIL,
    replyTo: formData.email,
    subject: `Contact Form: ${formData.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007BFF;">New Contact Form Submission</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Contact Information</h3>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Phone:</strong> ${formData.phone}</p>
          <p><strong>Subject:</strong> ${formData.subject}</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Message</h3>
          <p style="white-space: pre-wrap;">${formData.message}</p>
        </div>
        
        <p>Please respond to this inquiry as soon as possible.</p>
      </div>
    `,
  }

  return sendWithRetry(mailOptions)
}

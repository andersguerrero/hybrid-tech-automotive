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

  try {
    const missing = getMissingEnvVars(['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'])
    if (missing.length) {
      return { success: false, error: new Error(`Faltan variables SMTP: ${missing.join(', ')}`) }
    }
    // Verify SMTP connection before sending
    await transporter.verify()
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
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

  try {
    const missing = getMissingEnvVars(['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'])
    if (missing.length) {
      return { success: false, error: new Error(`Faltan variables SMTP: ${missing.join(', ')}`) }
    }
    // Verify SMTP connection before sending
    await transporter.verify()
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Error sending contact form:', error)
    return { success: false, error }
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { getOrdersByEmail } from '@/lib/orders'
import nodemailer from 'nodemailer'

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: (process.env.SMTP_SECURE || '').toLowerCase() === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if orders exist for this email (don't reveal this to the user)
    const orders = await getOrdersByEmail(email)

    // Always return success to prevent email enumeration
    if (orders.length === 0) {
      return NextResponse.json({ success: true, message: 'If orders exist for this email, you will receive a link shortly.' })
    }

    // Generate a temporary token valid for 1 hour
    const token = await new SignJWT({ email, purpose: 'order-lookup' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(getSecret())

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hybridtechauto.com'
    const magicLink = `${baseUrl}/my-orders?token=${token}`

    // Send magic link email
    await transporter.sendMail({
      from: process.env.BUSINESS_EMAIL || process.env.SMTP_USER,
      to: email,
      subject: 'Your Order History - Hybrid Tech Auto',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007BFF;">View Your Orders</h2>
          <p>You requested to view your order history at Hybrid Tech Auto.</p>
          <p>Click the button below to view your orders. This link is valid for 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLink}" style="background-color: #007BFF; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              View My Orders
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Hybrid Tech Automotive LLC<br>
            ${process.env.NEXT_PUBLIC_BUSINESS_PHONE || '(832) 762-5299'}
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true, message: 'If orders exist for this email, you will receive a link shortly.' })
  } catch (error) {
    console.error('Order lookup error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

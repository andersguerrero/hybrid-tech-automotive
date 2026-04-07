import { NextRequest, NextResponse } from 'next/server'
import { sendNewsletterWelcome } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Send welcome email (non-blocking)
    sendNewsletterWelcome(normalizedEmail).catch((err) =>
      console.error('[Subscribe] Welcome email error:', err)
    )

    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing!',
    })
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process subscription' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, createToken, getAuthCookieConfig } from '@/lib/auth'

const failedAttempts = new Map<string, { count: number; lastAttempt: number }>()

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'

    // Rate limiting: 5 attempts per 15 minutes
    const attempts = failedAttempts.get(ip)
    if (attempts && attempts.count >= 5) {
      const elapsed = Date.now() - attempts.lastAttempt
      if (elapsed < 15 * 60 * 1000) {
        return NextResponse.json(
          { success: false, error: 'Too many login attempts. Try again later.' },
          { status: 429 }
        )
      }
      failedAttempts.delete(ip)
    }

    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      )
    }

    if (!verifyPassword(password)) {
      const current = failedAttempts.get(ip) || { count: 0, lastAttempt: 0 }
      failedAttempts.set(ip, { count: current.count + 1, lastAttempt: Date.now() })

      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Clear failed attempts on success
    failedAttempts.delete(ip)

    const token = await createToken()
    const cookieConfig = getAuthCookieConfig(token)

    const response = NextResponse.json({ success: true })
    response.cookies.set(cookieConfig)

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

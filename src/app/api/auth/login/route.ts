import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, createToken, getAuthCookieConfig } from '@/lib/auth'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rateLimit'
import { loginSchema, formatZodError } from '@/lib/validations'
import logger from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request)

    // Rate limiting: 5 attempts per 15 minutes
    const rateCheck = checkRateLimit(ip, RATE_LIMITS.login)
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)) } }
      )
    }

    const body = await request.json()

    // Zod validation
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: formatZodError(parsed.error) },
        { status: 400 }
      )
    }

    const { password } = parsed.data

    // verifyPassword is now async (supports bcrypt)
    if (!(await verifyPassword(password))) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      )
    }

    const token = await createToken()
    const cookieConfig = getAuthCookieConfig(token)

    const response = NextResponse.json({ success: true })
    response.cookies.set(cookieConfig)

    return response
  } catch (error) {
    logger.error('Login error:', error as Error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import {
  verifyAdminCredentials,
  createToken,
  getAuthCookieConfig,
} from '@/lib/auth'
import { verifyTotpCode } from '@/lib/totp'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rateLimit'
import { loginSchema, formatZodError } from '@/lib/validations'
import { prisma } from '@/lib/db'
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

    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: formatZodError(parsed.error) },
        { status: 400 }
      )
    }

    const { email, password, totpCode } = parsed.data

    const user = await verifyAdminCredentials(email, password)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // 2FA gate: if the user has TOTP enabled, require a valid code in the same request.
    if (user.totpEnabled) {
      if (!totpCode) {
        return NextResponse.json(
          { success: false, totpRequired: true, error: 'TOTP code required' },
          { status: 401 }
        )
      }
      if (!user.totpSecret || !verifyTotpCode(user.totpSecret, totpCode)) {
        return NextResponse.json(
          { success: false, totpRequired: true, error: 'Invalid TOTP code' },
          { status: 401 }
        )
      }
    }

    if (prisma) {
      await prisma.adminUser.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      })
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
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

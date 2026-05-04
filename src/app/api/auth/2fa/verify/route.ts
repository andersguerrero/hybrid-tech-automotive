import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserPayload } from '@/lib/auth'
import { verifyTotpCode } from '@/lib/totp'
import { totpVerifySchema, formatZodError } from '@/lib/validations'
import { prisma } from '@/lib/db'
import logger from '@/lib/logger'

/**
 * POST /api/auth/2fa/verify
 *
 * Confirms a TOTP code against the pending secret stored during /setup.
 * On success, sets totpEnabled=true, finishing 2FA enrollment.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getCurrentUserPayload(request)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!prisma) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
    }

    const body = await request.json()
    const parsed = totpVerifySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 })
    }

    const user = await prisma.adminUser.findUnique({ where: { id: payload.userId } })
    if (!user || !user.totpSecret) {
      return NextResponse.json(
        { error: 'No pending 2FA setup. Start with /setup first.' },
        { status: 400 }
      )
    }

    if (!verifyTotpCode(user.totpSecret, parsed.data.code)) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 401 })
    }

    await prisma.adminUser.update({
      where: { id: user.id },
      data: { totpEnabled: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('2FA verify error:', error as Error)
    return NextResponse.json({ error: 'Failed to verify 2FA' }, { status: 500 })
  }
}

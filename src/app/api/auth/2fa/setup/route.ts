import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserPayload } from '@/lib/auth'
import { generateTotpSecret, buildOtpauthUrl, buildOtpauthQrDataUrl } from '@/lib/totp'
import { prisma } from '@/lib/db'
import logger from '@/lib/logger'

/**
 * POST /api/auth/2fa/setup
 *
 * Generates a fresh TOTP secret for the authenticated admin and stores it on
 * the user (with totpEnabled still false). The client must then POST to
 * /api/auth/2fa/verify with a valid code to actually enable 2FA.
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

    const user = await prisma.adminUser.findUnique({ where: { id: payload.userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const secret = generateTotpSecret()
    const otpauthUrl = buildOtpauthUrl(user.email, secret)
    const qrCodeDataUrl = await buildOtpauthQrDataUrl(otpauthUrl)

    await prisma.adminUser.update({
      where: { id: user.id },
      data: { totpSecret: secret, totpEnabled: false },
    })

    return NextResponse.json({ secret, otpauthUrl, qrCodeDataUrl })
  } catch (error) {
    logger.error('2FA setup error:', error as Error)
    return NextResponse.json({ error: 'Failed to start 2FA setup' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getCurrentUserPayload } from '@/lib/auth'
import { totpDisableSchema, formatZodError } from '@/lib/validations'
import { prisma } from '@/lib/db'
import logger from '@/lib/logger'

/**
 * POST /api/auth/2fa/disable
 *
 * Requires the admin's current password to disable 2FA. Clears the secret
 * so the next /setup starts fresh.
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
    const parsed = totpDisableSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 })
    }

    const user = await prisma.adminUser.findUnique({ where: { id: payload.userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const ok = await bcrypt.compare(parsed.data.password, user.passwordHash)
    if (!ok) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    await prisma.adminUser.update({
      where: { id: user.id },
      data: { totpSecret: null, totpEnabled: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('2FA disable error:', error as Error)
    return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 })
  }
}

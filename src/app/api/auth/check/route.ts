import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserPayload } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const payload = await getCurrentUserPayload(request)
  if (!payload) {
    return NextResponse.json({ authenticated: false })
  }

  if (!prisma) {
    return NextResponse.json({ authenticated: false })
  }

  const user = await prisma.adminUser.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true, totpEnabled: true },
  })

  if (!user) {
    return NextResponse.json({ authenticated: false })
  }

  return NextResponse.json({ authenticated: true, user })
}

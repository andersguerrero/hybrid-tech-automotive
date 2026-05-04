import { NextResponse } from 'next/server'
import { getClearedAuthCookieConfig } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(getClearedAuthCookieConfig())
  return response
}

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { getOrdersByEmail } from '@/lib/orders'

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Verify token
    const { payload } = await jwtVerify(token, getSecret())

    if (payload.purpose !== 'order-lookup' || typeof payload.email !== 'string') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    const orders = await getOrdersByEmail(payload.email)

    return NextResponse.json({
      success: true,
      email: payload.email,
      orders,
    })
  } catch {
    return NextResponse.json({ error: 'Invalid or expired link. Please request a new one.' }, { status: 401 })
  }
}

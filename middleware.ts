import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const AUTH_COOKIE_NAME = 'admin_token'

const PROTECTED_API_ROUTES = [
  '/api/batteries',
  '/api/save-batteries-to-source',
  '/api/upload-image',
  '/api/prices',
  '/api/site-images',
  '/api/services',
  '/api/blog',
  '/api/reviews',
  '/api/hours',
  '/api/contact-info',
  '/api/orders',
]

async function verifyTokenEdge(token: string): Promise<boolean> {
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) return false
    const key = new TextEncoder().encode(secret)
    await jwtVerify(token, key)
    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow the login page and auth API routes without auth
  if (pathname === '/admin/login' || pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  // For protected API routes, only protect write operations (POST/PUT/DELETE)
  if (PROTECTED_API_ROUTES.some(route => pathname.startsWith(route))) {
    if (request.method === 'GET') {
      return NextResponse.next()
    }

    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    if (!token || !(await verifyTokenEdge(token))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.next()
  }

  // For admin pages, require auth
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    if (!token || !(await verifyTokenEdge(token))) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/batteries/:path*',
    '/api/save-batteries-to-source/:path*',
    '/api/upload-image/:path*',
    '/api/prices/:path*',
    '/api/site-images/:path*',
    '/api/services/:path*',
    '/api/blog/:path*',
    '/api/reviews/:path*',
    '/api/hours/:path*',
    '/api/contact-info/:path*',
    '/api/orders/:path*',
  ],
}

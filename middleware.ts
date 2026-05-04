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
  '/api/coupons',
  '/api/subscribers',
  '/api/seed',
]

// Exact paths that require admin auth on every method (including GET) because
// they expose PII or admin-only data. Subroutes (e.g. /api/orders/lookup,
// /api/orders/verify, /api/coupons/validate) handle their own auth.
const ADMIN_GET_PROTECTED = new Set([
  '/api/orders',
  '/api/subscribers',
  '/api/coupons',
  '/api/seed',
])

/**
 * Security headers added to all responses
 */
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}

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
    const response = NextResponse.next()
    applySecurityHeaders(response)
    return response
  }

  // Allow Stripe webhooks without auth (verified by Stripe signature in handler)
  if (pathname === '/api/stripe/webhook') {
    return NextResponse.next()
  }

  // For protected API routes, protect write operations (POST/PUT/DELETE) and
  // also protect GET on routes that expose PII or admin-only data.
  if (PROTECTED_API_ROUTES.some(route => pathname.startsWith(route))) {
    const requireAuth =
      request.method !== 'GET' || ADMIN_GET_PROTECTED.has(pathname)

    if (!requireAuth) {
      const response = NextResponse.next()
      applySecurityHeaders(response)
      return response
    }

    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    if (!token || !(await verifyTokenEdge(token))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const response = NextResponse.next()
    applySecurityHeaders(response)
    return response
  }

  // For admin pages, require auth
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    if (!token || !(await verifyTokenEdge(token))) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
    const response = NextResponse.next()
    applySecurityHeaders(response)
    return response
  }

  const response = NextResponse.next()
  applySecurityHeaders(response)
  return response
}

function applySecurityHeaders(response: NextResponse) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }
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
    '/api/coupons/:path*',
    '/api/subscribers/:path*',
    '/api/seed/:path*',
    '/api/contact',
    '/api/booking',
    '/api/stripe/:path*',
  ],
}

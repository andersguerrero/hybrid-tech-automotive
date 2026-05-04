import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { validateOrigin } from '@/lib/csrf'

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

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

/**
 * Content Security Policy. Permissive enough for Stripe + Sentry +
 * Vercel Analytics/Blob, strict enough to block off-origin script loads
 * and clickjacking. Inline + eval are allowed to keep Next.js working
 * without a per-request nonce; revisit if/when we add nonce-based CSP.
 */
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://m.stripe.network https://*.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.stripe.com https://m.stripe.com https://m.stripe.network https://*.ingest.sentry.io https://*.sentry.io https://*.public.blob.vercel-storage.com https://vitals.vercel-insights.com",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ')

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Content-Security-Policy': CSP_DIRECTIVES,
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

  // Stripe webhooks: signature-verified inside the handler. Skip middleware
  // entirely so we don't disturb the raw body or add headers Stripe doesn't
  // expect.
  if (pathname === '/api/stripe/webhook') {
    return NextResponse.next()
  }

  // CSRF defense-in-depth: reject unsafe-method requests whose Origin/Referer
  // doesn't match our allow-list. SameSite=Lax cookies already block most
  // cross-site CSRF; this catches the remaining edge cases (e.g. pre-flighted
  // requests from foreign origins, mis-set SameSite on legacy clients).
  if (!SAFE_METHODS.has(request.method) && !validateOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  // Allow the login page and auth API routes without an admin cookie.
  if (pathname === '/admin/login' || pathname.startsWith('/api/auth/')) {
    const response = NextResponse.next()
    applySecurityHeaders(response)
    return response
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
  // HSTS only in production (over HTTPS); 1 year, include subdomains.
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    )
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/auth/:path*',
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

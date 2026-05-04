/**
 * CSRF Protection using Origin/Referer header validation
 *
 * OWASP-recommended "Origin Header Check" approach:
 * - Verifies that unsafe-method requests come from our own domain
 * - No tokens needed; complements SameSite=Lax cookies for defense in depth
 *
 * As of the security middleware refactor, validateOrigin is enforced for
 * every non-GET request that flows through middleware (see middleware.ts).
 * The /api/stripe/webhook handler bypasses middleware entirely because it
 * authenticates via Stripe's HMAC signature.
 */

import { NextRequest } from 'next/server'

/**
 * Get allowed origins from environment
 */
function getAllowedOrigins(): string[] {
  const origins: string[] = []

  if (process.env.NEXT_PUBLIC_BASE_URL) {
    origins.push(process.env.NEXT_PUBLIC_BASE_URL)
  }

  // Always allow localhost in development
  if (process.env.NODE_ENV !== 'production') {
    origins.push('http://localhost:3000')
    origins.push('http://localhost:3001')
    origins.push('http://0.0.0.0:3000')
  }

  return origins
}

/**
 * Validate that a request originates from our domain
 * Returns true if the request is safe (same-origin or trusted)
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const allowedOrigins = getAllowedOrigins()

  // If no origin AND no referer, this might be a non-browser client
  // Allow it — API-key or JWT auth should handle authorization
  if (!origin && !referer) {
    return true
  }

  // Check Origin header (most reliable)
  if (origin) {
    return allowedOrigins.some((allowed) => origin === allowed)
  }

  // Fallback to Referer header
  if (referer) {
    return allowedOrigins.some((allowed) => referer.startsWith(allowed))
  }

  return false
}

/**
 * Routes that should skip CSRF validation
 * (They have their own authentication mechanisms)
 */
const CSRF_EXEMPT_ROUTES = [
  '/api/stripe/webhook',  // Authenticated via Stripe signature
  '/api/auth/',           // Login/logout — no prior cookie exists
]

/**
 * Check if a route should skip CSRF validation
 */
export function isCSRFExempt(pathname: string): boolean {
  return CSRF_EXEMPT_ROUTES.some((route) => pathname.startsWith(route))
}

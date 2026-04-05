/**
 * In-memory rate limiter for API routes
 * Tracks requests per IP with sliding window
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const limiters = new Map<string, Map<string, RateLimitEntry>>()

// Clean up expired entries every 5 minutes (unref to not block process exit)
const cleanupTimer = setInterval(() => {
  const now = Date.now()
  limiters.forEach((entries) => {
    entries.forEach((entry, key) => {
      if (now > entry.resetAt) {
        entries.delete(key)
      }
    })
  })
}, 5 * 60 * 1000)

// Allow Node.js to exit even if the timer is active
if (typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
  cleanupTimer.unref()
}

interface RateLimitConfig {
  /** Unique identifier for this limiter (e.g., 'contact-form') */
  name: string
  /** Maximum number of requests allowed in the window */
  maxRequests: number
  /** Time window in seconds */
  windowSeconds: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

/**
 * Check rate limit for a given identifier (usually IP address)
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const { name, maxRequests, windowSeconds } = config
  const now = Date.now()

  if (!limiters.has(name)) {
    limiters.set(name, new Map())
  }

  const entries = limiters.get(name)!
  const entry = entries.get(identifier)

  // No previous entry or window expired
  if (!entry || now > entry.resetAt) {
    entries.set(identifier, {
      count: 1,
      resetAt: now + windowSeconds * 1000,
    })
    return { success: true, remaining: maxRequests - 1, resetAt: now + windowSeconds * 1000 }
  }

  // Within window, check count
  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  // Increment count
  entry.count++
  return { success: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt }
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  return 'unknown'
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const RATE_LIMITS = {
  contactForm: {
    name: 'contact-form',
    maxRequests: 3,
    windowSeconds: 15 * 60, // 3 per 15 minutes
  },
  booking: {
    name: 'booking',
    maxRequests: 5,
    windowSeconds: 15 * 60, // 5 per 15 minutes
  },
  orderLookup: {
    name: 'order-lookup',
    maxRequests: 5,
    windowSeconds: 15 * 60, // 5 per 15 minutes
  },
  stripeCheckout: {
    name: 'stripe-checkout',
    maxRequests: 10,
    windowSeconds: 15 * 60, // 10 per 15 minutes
  },
  login: {
    name: 'login',
    maxRequests: 5,
    windowSeconds: 15 * 60, // 5 per 15 minutes
  },
} as const

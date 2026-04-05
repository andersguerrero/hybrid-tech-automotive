import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { timingSafeEqual } from 'crypto'

export const AUTH_COOKIE_NAME = 'admin_token'

const getSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  return new TextEncoder().encode(secret)
}

export async function createToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<{ role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as { role: string }
  } catch {
    return null
  }
}

/**
 * Verify admin password with bcrypt hash or constant-time plain text comparison
 *
 * Priority:
 * 1. If ADMIN_PASSWORD_HASH is set → use bcrypt.compare (most secure)
 * 2. If only ADMIN_PASSWORD is set → use timing-safe comparison (backward compatible)
 *
 * To generate a hash: node scripts/hash-password.js "YourPassword"
 */
export async function verifyPassword(password: string): Promise<boolean> {
  // Option 1: bcrypt hash (preferred, most secure)
  const passwordHash = process.env.ADMIN_PASSWORD_HASH
  if (passwordHash) {
    try {
      return await bcrypt.compare(password, passwordHash)
    } catch {
      console.error('Error comparing bcrypt hash — check ADMIN_PASSWORD_HASH format')
      return false
    }
  }

  // Option 2: Plain text with constant-time comparison (backward compatible)
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    console.error('Neither ADMIN_PASSWORD_HASH nor ADMIN_PASSWORD is set')
    return false
  }

  if (process.env.NODE_ENV === 'production') {
    console.warn(
      '⚠️  Using plain-text ADMIN_PASSWORD. For better security, set ADMIN_PASSWORD_HASH instead. ' +
      'Run: node scripts/hash-password.js "your-password"'
    )
  }

  // Constant-time comparison prevents timing attacks
  try {
    const inputBuf = Buffer.from(password.padEnd(256, '\0'))
    const storedBuf = Buffer.from(adminPassword.padEnd(256, '\0'))
    return timingSafeEqual(inputBuf, storedBuf) && password.length === adminPassword.length
  } catch {
    return false
  }
}

export function getAuthCookieConfig(token: string) {
  return {
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 86400, // 24 hours
  }
}

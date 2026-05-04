import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import logger from '@/lib/logger'

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
 * Verify admin password against the bcrypt hash in ADMIN_PASSWORD_HASH.
 *
 * To generate a hash: node scripts/hash-password.js "YourPassword"
 */
export async function verifyPassword(password: string): Promise<boolean> {
  const passwordHash = process.env.ADMIN_PASSWORD_HASH
  if (!passwordHash) {
    logger.error('ADMIN_PASSWORD_HASH is not set')
    return false
  }

  try {
    return await bcrypt.compare(password, passwordHash)
  } catch {
    logger.error('Error comparing bcrypt hash — check ADMIN_PASSWORD_HASH format')
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

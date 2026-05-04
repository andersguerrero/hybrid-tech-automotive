import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import logger from '@/lib/logger'

export const AUTH_COOKIE_NAME = 'admin_token'
const BCRYPT_ROUNDS = 12

export interface AdminTokenPayload {
  userId: string
  email: string
  role: string
}

const getSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  return new TextEncoder().encode(secret)
}

export async function createToken(user: AdminTokenPayload): Promise<string> {
  return new SignJWT({ userId: user.userId, email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (
      typeof payload.userId !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.role !== 'string'
    ) {
      return null
    }
    return { userId: payload.userId, email: payload.email, role: payload.role }
  } catch {
    return null
  }
}

export async function getCurrentUserPayload(
  request: NextRequest
): Promise<AdminTokenPayload | null> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

/**
 * Verify an admin's email + password against the AdminUser table.
 * Returns the matching user record, or null on any failure.
 *
 * Failures (missing user, wrong password, no DB) all return null and log
 * server-side; the API route should respond with a generic "invalid
 * credentials" error to avoid user enumeration.
 */
export async function verifyAdminCredentials(email: string, password: string) {
  if (!prisma) {
    logger.error('verifyAdminCredentials: Prisma client unavailable (DATABASE_URL not set)')
    return null
  }

  const user = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase().trim() },
  })
  if (!user) return null

  try {
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return null
    return user
  } catch {
    logger.error('Error comparing bcrypt hash — check passwordHash format')
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
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

export function getClearedAuthCookieConfig() {
  return {
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  }
}

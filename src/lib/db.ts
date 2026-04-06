import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Ensure DATABASE_URL has proper connection pool settings to prevent
 * exhaustion under concurrent API requests.
 */
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL!
  const separator = url.includes('?') ? '&' : '?'
  const params: string[] = []

  // Pool size: allow enough concurrent connections for Next.js API routes
  if (!url.includes('connection_limit')) {
    params.push('connection_limit=15')
  }
  // Pool timeout: fail fast (10s) instead of hanging forever
  if (!url.includes('pool_timeout')) {
    params.push('pool_timeout=10')
  }
  // Connect timeout: don't wait forever for initial connection
  if (!url.includes('connect_timeout')) {
    params.push('connect_timeout=10')
  }

  return params.length > 0 ? `${url}${separator}${params.join('&')}` : url
}

/**
 * Prisma client singleton.
 * - Only created when DATABASE_URL is set
 * - In development, stored globally to survive hot reloads
 * - Returns undefined when PostgreSQL is not configured
 * - Configured with connection_limit=15, pool_timeout=10s, connect_timeout=10s
 */
export const prisma: PrismaClient | undefined =
  globalForPrisma.prisma ??
  (process.env.DATABASE_URL
    ? new PrismaClient({
        datasources: {
          db: {
            url: getDatabaseUrl(),
          },
        },
        log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn'],
      })
    : undefined)

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma
}

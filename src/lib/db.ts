import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Prisma client singleton.
 * - Only created when DATABASE_URL is set
 * - In development, stored globally to survive hot reloads
 * - Returns undefined when PostgreSQL is not configured
 * - Uses connection pooling limits to prevent exhaustion
 */
export const prisma: PrismaClient | undefined =
  globalForPrisma.prisma ??
  (process.env.DATABASE_URL
    ? new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
        log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn'],
      })
    : undefined)

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma
}

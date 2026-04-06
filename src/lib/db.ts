import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Prisma client singleton.
 * - Only created when DATABASE_URL is set
 * - In development, stored globally to survive hot reloads
 * - Returns undefined when PostgreSQL is not configured
 */
export const prisma: PrismaClient | undefined =
  globalForPrisma.prisma ??
  (process.env.DATABASE_URL ? new PrismaClient() : undefined)

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma
}

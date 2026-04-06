import { NextResponse } from 'next/server'
import logger from '@/lib/logger'

interface ServiceCheck {
  status: 'ok' | 'degraded' | 'down'
  latencyMs?: number
  message?: string
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  version: string
  services: {
    database: ServiceCheck
    storage: ServiceCheck
    stripe: ServiceCheck
    smtp: ServiceCheck
  }
}

const startTime = Date.now()

async function checkDatabase(): Promise<ServiceCheck> {
  const start = Date.now()
  try {
    if (!process.env.DATABASE_URL) {
      return { status: 'degraded', message: 'DATABASE_URL not configured' }
    }
    const { prisma } = await import('@/lib/db')
    if (!prisma) {
      return { status: 'down', message: 'Prisma client unavailable' }
    }
    await prisma.$queryRaw`SELECT 1`
    return { status: 'ok', latencyMs: Date.now() - start, message: 'PostgreSQL connected' }
  } catch (error) {
    logger.error('Health check: database failed', error as Error)
    return { status: 'down', latencyMs: Date.now() - start, message: 'PostgreSQL unreachable' }
  }
}

async function checkStorage(): Promise<ServiceCheck> {
  const start = Date.now()
  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { list } = await import('@vercel/blob')
      await list({ limit: 1 })
      return { status: 'ok', latencyMs: Date.now() - start }
    }
    // Local mode — check if data dir is accessible
    const { existsSync } = await import('fs')
    const { join } = await import('path')
    const dataDir = join(process.cwd(), 'data')
    return {
      status: existsSync(dataDir) ? 'ok' : 'degraded',
      latencyMs: Date.now() - start,
      message: process.env.BLOB_READ_WRITE_TOKEN ? undefined : 'local file storage',
    }
  } catch (error) {
    logger.error('Health check: storage failed', error as Error)
    return { status: 'down', latencyMs: Date.now() - start, message: 'Storage unreachable' }
  }
}

async function checkStripe(): Promise<ServiceCheck> {
  const start = Date.now()
  try {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      return { status: 'degraded', message: 'STRIPE_SECRET_KEY not configured' }
    }
    // Light check: verify key format without making an API call
    const isLive = key.startsWith('sk_live_')
    const isTest = key.startsWith('sk_test_')
    if (!isLive && !isTest) {
      return { status: 'down', message: 'Invalid Stripe key format' }
    }
    return {
      status: 'ok',
      latencyMs: Date.now() - start,
      message: isLive ? 'live mode' : 'test mode',
    }
  } catch (error) {
    logger.error('Health check: Stripe failed', error as Error)
    return { status: 'down', latencyMs: Date.now() - start, message: 'Stripe check failed' }
  }
}

async function checkSMTP(): Promise<ServiceCheck> {
  const start = Date.now()
  try {
    const host = process.env.SMTP_HOST || process.env.EMAIL_HOST
    const user = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.EMAIL_FROM
    if (!host && !user) {
      return { status: 'degraded', message: 'SMTP not configured' }
    }
    return {
      status: 'ok',
      latencyMs: Date.now() - start,
      message: `${host || 'configured'}`,
    }
  } catch (error) {
    logger.error('Health check: SMTP failed', error as Error)
    return { status: 'down', latencyMs: Date.now() - start, message: 'SMTP check failed' }
  }
}

export async function GET() {
  const [database, storage, stripe, smtp] = await Promise.all([
    checkDatabase(),
    checkStorage(),
    checkStripe(),
    checkSMTP(),
  ])

  const services = { database, storage, stripe, smtp }
  const allStatuses = Object.values(services).map(s => s.status)

  let overallStatus: HealthResponse['status'] = 'healthy'
  if (allStatuses.includes('down')) {
    overallStatus = 'unhealthy'
  } else if (allStatuses.includes('degraded')) {
    overallStatus = 'degraded'
  }

  const response: HealthResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    version: process.env.npm_package_version || '0.1.0',
    services,
  }

  logger.info('Health check completed', { status: overallStatus })

  return NextResponse.json(response, {
    status: overallStatus === 'unhealthy' ? 503 : 200,
    headers: { 'Cache-Control': 'no-store' },
  })
}

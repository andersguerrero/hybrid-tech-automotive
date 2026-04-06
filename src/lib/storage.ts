import { put, list } from '@vercel/blob'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import logger from '@/lib/logger'

// ─── Local file helpers ───────────────────────────────────────────────────────

function getLocalPath(filename: string): string {
  return process.env.VERCEL
    ? join('/tmp', filename)
    : join(process.cwd(), 'data', filename)
}

// ─── PostgreSQL via Prisma ────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */

async function getPrisma() {
  const { prisma } = await import('@/lib/db')
  if (!prisma) throw new Error('Prisma client not available')
  return prisma
}

async function pgGet<T>(blobPath: string, defaults: T): Promise<T> {
  const prisma = await getPrisma()

  switch (blobPath) {
    case 'config/batteries-custom.json': {
      const rows = await prisma.battery.findMany()
      return (rows.length > 0 ? rows : defaults) as T
    }
    case 'config/services-custom.json': {
      const rows = await prisma.service.findMany()
      return (rows.length > 0 ? rows : defaults) as T
    }
    case 'config/reviews-custom.json': {
      const rows = await prisma.review.findMany()
      return (rows.length > 0 ? rows : defaults) as T
    }
    case 'config/blog-custom.json': {
      const rows = await prisma.blogPost.findMany()
      return (rows.length > 0 ? rows : defaults) as T
    }
    case 'config/orders.json': {
      const rows = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } })
      return (rows.length > 0 ? rows : defaults) as T
    }
    case 'config/coupons.json': {
      const rows = await prisma.coupon.findMany()
      return (rows.length > 0 ? rows : defaults) as T
    }
    case 'config/subscribers.json': {
      const rows = await prisma.subscriber.findMany()
      return (rows.length > 0 ? rows : defaults) as T
    }
    case 'config/price-history.json': {
      const rows = await prisma.priceRecord.findMany()
      // Strip auto-generated id — PriceRecord interface only has batteryId, price, date
      return (rows.length > 0
        ? rows.map(({ id: _id, ...rest }) => rest)
        : defaults) as T
    }
    default: {
      // Site config (contact-custom, hours-custom, site-images)
      const config = await prisma.siteConfig.findUnique({ where: { key: blobPath } })
      return (config ? (config.data as T) : defaults)
    }
  }
}

async function pgPut(blobPath: string, data: unknown): Promise<void> {
  const prisma = await getPrisma()

  switch (blobPath) {
    case 'config/batteries-custom.json': {
      await prisma.$transaction([
        prisma.battery.deleteMany(),
        prisma.battery.createMany({ data: data as any[] }),
      ])
      return
    }
    case 'config/services-custom.json': {
      await prisma.$transaction([
        prisma.service.deleteMany(),
        prisma.service.createMany({ data: data as any[] }),
      ])
      return
    }
    case 'config/reviews-custom.json': {
      await prisma.$transaction([
        prisma.review.deleteMany(),
        prisma.review.createMany({ data: data as any[] }),
      ])
      return
    }
    case 'config/blog-custom.json': {
      await prisma.$transaction([
        prisma.blogPost.deleteMany(),
        prisma.blogPost.createMany({ data: data as any[] }),
      ])
      return
    }
    case 'config/orders.json': {
      await prisma.$transaction([
        prisma.order.deleteMany(),
        prisma.order.createMany({ data: data as any[] }),
      ])
      return
    }
    case 'config/coupons.json': {
      await prisma.$transaction([
        prisma.coupon.deleteMany(),
        prisma.coupon.createMany({ data: data as any[] }),
      ])
      return
    }
    case 'config/subscribers.json': {
      await prisma.$transaction([
        prisma.subscriber.deleteMany(),
        prisma.subscriber.createMany({ data: data as any[] }),
      ])
      return
    }
    case 'config/price-history.json': {
      // Strip id field — auto-incremented by PostgreSQL
      const items = (data as any[]).map(({ id: _id, ...rest }) => rest)
      await prisma.$transaction([
        prisma.priceRecord.deleteMany(),
        prisma.priceRecord.createMany({ data: items }),
      ])
      return
    }
    default: {
      // Site config — upsert key-value
      await prisma.siteConfig.upsert({
        where: { key: blobPath },
        create: { key: blobPath, data: data as any },
        update: { data: data as any, updatedAt: new Date() },
      })
      return
    }
  }
}

/* eslint-enable @typescript-eslint/no-explicit-any */

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Read data from storage.
 * Priority: PostgreSQL → Vercel Blob → Local files
 */
export async function blobGet<T>(blobPath: string, localFilename: string, defaults: T): Promise<T> {
  try {
    // Priority 1: PostgreSQL (when DATABASE_URL is configured)
    if (process.env.DATABASE_URL) {
      return await pgGet<T>(blobPath, defaults)
    }

    // Priority 2: Vercel Blob (when BLOB_READ_WRITE_TOKEN is configured)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { blobs } = await list({ prefix: blobPath.split('/').slice(0, -1).join('/') + '/' })
      const blob = blobs.find((b) => b.pathname === blobPath)

      if (blob?.url) {
        const response = await fetch(blob.url)
        const data = await response.json()
        return data as T
      }
      return defaults
    }

    // Priority 3: Local files
    const localPath = getLocalPath(localFilename)
    if (existsSync(localPath)) {
      const content = await readFile(localPath, 'utf-8')
      return JSON.parse(content) as T
    }

    return defaults
  } catch (error) {
    logger.error(`Error reading from ${blobPath}:`, error as Error)
    return defaults
  }
}

/**
 * Write data to storage.
 * Priority: PostgreSQL → Vercel Blob → Local files
 */
export async function blobPut(blobPath: string, localFilename: string, data: unknown): Promise<void> {
  // Priority 1: PostgreSQL
  if (process.env.DATABASE_URL) {
    await pgPut(blobPath, data)
    return
  }

  const json = JSON.stringify(data, null, 2)

  // Priority 2: Vercel Blob
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await put(blobPath, json, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    })
    return
  }

  // Priority 3: Local files
  const localPath = getLocalPath(localFilename)
  const dataDir = join(process.cwd(), 'data')
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true })
  }
  await writeFile(localPath, json, 'utf-8')
}

import { NextRequest, NextResponse } from 'next/server'
import { batteries } from '@/data/batteries'
import { services } from '@/data/services'
import logger from '@/lib/logger'

/**
 * POST /api/seed
 *
 * Seeds the PostgreSQL database with static data (batteries, services).
 * Requires DATABASE_URL to be configured.
 * Protected by admin auth in middleware.
 *
 * Query params:
 *   force=true  - Drop existing data and re-seed
 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'DATABASE_URL not configured. PostgreSQL is required for seeding.' },
        { status: 400 }
      )
    }

    const { prisma } = await import('@/lib/db')
    if (!prisma) {
      return NextResponse.json(
        { error: 'Prisma client not available' },
        { status: 500 }
      )
    }

    const force = request.nextUrl.searchParams.get('force') === 'true'
    const results: Record<string, string> = {}

    // Seed batteries
    const existingBatteries = await prisma.battery.count()
    if (existingBatteries === 0 || force) {
      if (force) await prisma.battery.deleteMany()
      await prisma.battery.createMany({
        data: batteries,
        skipDuplicates: true,
      })
      results.batteries = `Seeded ${batteries.length} batteries`
    } else {
      results.batteries = `Skipped (${existingBatteries} already exist)`
    }

    // Seed services
    const existingServices = await prisma.service.count()
    if (existingServices === 0 || force) {
      if (force) await prisma.service.deleteMany()
      await prisma.service.createMany({
        data: services,
        skipDuplicates: true,
      })
      results.services = `Seeded ${services.length} services`
    } else {
      results.services = `Skipped (${existingServices} already exist)`
    }

    // Check other tables
    const counts = {
      orders: await prisma.order.count(),
      reviews: await prisma.review.count(),
      blogPosts: await prisma.blogPost.count(),
      coupons: await prisma.coupon.count(),
      subscribers: await prisma.subscriber.count(),
      priceRecords: await prisma.priceRecord.count(),
      siteConfig: await prisma.siteConfig.count(),
    }

    logger.info('Database seeded', { results, counts })

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      results,
      tableCounts: {
        batteries: force ? batteries.length : existingBatteries,
        services: force ? services.length : existingServices,
        ...counts,
      },
    })
  } catch (error) {
    logger.error('Seed error:', error as Error)
    return NextResponse.json(
      { error: 'Failed to seed database', details: (error as Error).message },
      { status: 500 }
    )
  }
}

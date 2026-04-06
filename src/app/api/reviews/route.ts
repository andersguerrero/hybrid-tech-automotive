import { NextRequest, NextResponse } from 'next/server'
import { blobGet, blobPut } from '@/lib/storage'
import { reviews as defaultReviews } from '@/data'
import type { Review } from '@/types'
import logger from '@/lib/logger'

const BLOB_PATH = 'config/reviews-custom.json'
const LOCAL_FILE = 'reviews-custom.json'

export async function GET() {
  try {
    const reviews = await blobGet<Review[]>(BLOB_PATH, LOCAL_FILE, [])
    return NextResponse.json({
      success: true,
      reviews: reviews.length > 0 ? reviews : defaultReviews,
      source: reviews.length > 0 ? 'storage' : 'default',
    })
  } catch (error) {
    logger.error('Error reading reviews:', error as Error)
    return NextResponse.json({ success: true, reviews: defaultReviews, source: 'default' })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { reviews } = await request.json()

    if (!Array.isArray(reviews)) {
      return NextResponse.json(
        { success: false, error: 'Invalid data: reviews must be an array' },
        { status: 400 }
      )
    }

    await blobPut(BLOB_PATH, LOCAL_FILE, reviews)

    return NextResponse.json({
      success: true,
      message: 'Reviews saved successfully',
      count: reviews.length,
    })
  } catch (error) {
    logger.error('Error saving reviews:', error as Error)
    return NextResponse.json(
      { success: false, error: 'Error saving reviews' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { blobGet, blobPut } from '@/lib/storage'
import { blogPosts as defaultPosts } from '@/data'
import type { BlogPost } from '@/types'
import logger from '@/lib/logger'

const BLOB_PATH = 'config/blog-custom.json'
const LOCAL_FILE = 'blog-custom.json'

export async function GET() {
  try {
    const posts = await blobGet<BlogPost[]>(BLOB_PATH, LOCAL_FILE, [])
    return NextResponse.json({
      success: true,
      posts: posts.length > 0 ? posts : defaultPosts,
      source: posts.length > 0 ? 'storage' : 'default',
    })
  } catch (error) {
    logger.error('Error reading blog posts:', error as Error)
    return NextResponse.json({ success: true, posts: defaultPosts, source: 'default' })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { posts } = await request.json()

    if (!Array.isArray(posts)) {
      return NextResponse.json(
        { success: false, error: 'Invalid data: posts must be an array' },
        { status: 400 }
      )
    }

    await blobPut(BLOB_PATH, LOCAL_FILE, posts)

    return NextResponse.json({
      success: true,
      message: 'Blog posts saved successfully',
      count: posts.length,
    })
  } catch (error) {
    logger.error('Error saving blog posts:', error as Error)
    return NextResponse.json(
      { success: false, error: 'Error saving blog posts' },
      { status: 500 }
    )
  }
}

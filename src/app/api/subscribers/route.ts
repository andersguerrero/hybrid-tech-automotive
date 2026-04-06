import { NextRequest, NextResponse } from 'next/server'
import { blobGet, blobPut } from '@/lib/storage'
import logger from '@/lib/logger'

interface Subscriber {
  id: string
  email: string
  locale: string
  subscribedAt: string
  active: boolean
}

const BLOB_PATH = 'config/subscribers.json'
const LOCAL_FILE = 'subscribers.json'

export async function GET() {
  try {
    const subscribers = await blobGet<Subscriber[]>(BLOB_PATH, LOCAL_FILE, [])
    return NextResponse.json(subscribers)
  } catch (error) {
    logger.error('Error fetching subscribers:', error as Error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, locale, action } = await request.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const subscribers = await blobGet<Subscriber[]>(BLOB_PATH, LOCAL_FILE, [])

    if (action === 'unsubscribe') {
      const updated = subscribers.map(s =>
        s.email.toLowerCase() === email.toLowerCase() ? { ...s, active: false } : s
      )
      await blobPut(BLOB_PATH, LOCAL_FILE, updated)
      return NextResponse.json({ success: true, message: 'Unsubscribed successfully' })
    }

    // Check if already subscribed
    const existing = subscribers.find(s => s.email.toLowerCase() === email.toLowerCase())
    if (existing) {
      if (existing.active) {
        return NextResponse.json({ error: 'Email already subscribed' }, { status: 400 })
      }
      // Re-activate
      const updated = subscribers.map(s =>
        s.email.toLowerCase() === email.toLowerCase() ? { ...s, active: true } : s
      )
      await blobPut(BLOB_PATH, LOCAL_FILE, updated)
      return NextResponse.json({ success: true, message: 'Re-subscribed successfully' })
    }

    // Add new subscriber
    const newSubscriber: Subscriber = {
      id: `sub-${Date.now()}`,
      email: email.toLowerCase().trim(),
      locale: locale || 'en',
      subscribedAt: new Date().toISOString(),
      active: true,
    }

    subscribers.push(newSubscriber)
    await blobPut(BLOB_PATH, LOCAL_FILE, subscribers)

    return NextResponse.json({ success: true, message: 'Subscribed successfully' })
  } catch (error) {
    logger.error('Error managing subscriber:', error as Error)
    return NextResponse.json({ error: 'Failed to process subscription' }, { status: 500 })
  }
}

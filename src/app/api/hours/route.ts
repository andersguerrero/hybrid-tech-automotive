import { NextRequest, NextResponse } from 'next/server'
import { blobGet, blobPut } from '@/lib/storage'
import logger from '@/lib/logger'

interface BusinessHours {
  [key: string]: { open: string; close: string; closed?: boolean }
}

const BLOB_PATH = 'config/hours-custom.json'
const LOCAL_FILE = 'hours-custom.json'

const DEFAULT_HOURS: BusinessHours = {
  monday: { open: '8:00 AM', close: '6:00 PM' },
  tuesday: { open: '8:00 AM', close: '6:00 PM' },
  wednesday: { open: '8:00 AM', close: '6:00 PM' },
  thursday: { open: '8:00 AM', close: '6:00 PM' },
  friday: { open: '8:00 AM', close: '6:00 PM' },
  saturday: { open: '9:00 AM', close: '3:00 PM' },
  sunday: { open: '', close: '', closed: true },
}

export async function GET() {
  try {
    const hours = await blobGet<BusinessHours>(BLOB_PATH, LOCAL_FILE, DEFAULT_HOURS)
    return NextResponse.json({ success: true, hours })
  } catch (error) {
    logger.error('Error reading hours:', error as Error)
    return NextResponse.json({ success: true, hours: DEFAULT_HOURS })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { hours } = await request.json()

    if (!hours || typeof hours !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid data: hours must be an object' },
        { status: 400 }
      )
    }

    await blobPut(BLOB_PATH, LOCAL_FILE, hours)

    return NextResponse.json({
      success: true,
      message: 'Business hours saved successfully',
    })
  } catch (error) {
    logger.error('Error saving hours:', error as Error)
    return NextResponse.json(
      { success: false, error: 'Error saving hours' },
      { status: 500 }
    )
  }
}

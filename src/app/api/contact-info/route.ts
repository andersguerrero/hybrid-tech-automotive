import { NextRequest, NextResponse } from 'next/server'
import { blobGet, blobPut } from '@/lib/storage'
import logger from '@/lib/logger'

interface ContactInfo {
  phone: string
  email: string
  address: string
  mapUrl?: string
}

const BLOB_PATH = 'config/contact-custom.json'
const LOCAL_FILE = 'contact-custom.json'

const DEFAULT_CONTACT: ContactInfo = {
  phone: '(832) 762-5299',
  email: 'info@hybridtechauto.com',
  address: '24422 Starview Landing Ct, Spring, TX 77373',
}

export async function GET() {
  try {
    const contact = await blobGet<ContactInfo>(BLOB_PATH, LOCAL_FILE, DEFAULT_CONTACT)
    return NextResponse.json({ success: true, contact })
  } catch (error) {
    logger.error('Error reading contact info:', error as Error)
    return NextResponse.json({ success: true, contact: DEFAULT_CONTACT })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { contact } = await request.json()

    if (!contact || typeof contact !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid data: contact must be an object' },
        { status: 400 }
      )
    }

    await blobPut(BLOB_PATH, LOCAL_FILE, contact)

    return NextResponse.json({
      success: true,
      message: 'Contact info saved successfully',
    })
  } catch (error) {
    logger.error('Error saving contact info:', error as Error)
    return NextResponse.json(
      { success: false, error: 'Error saving contact info' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { blobGet, blobPut } from '@/lib/storage'
import { services as defaultServices } from '@/data/services'
import type { Service } from '@/types'

const BLOB_PATH = 'config/services-custom.json'
const LOCAL_FILE = 'services-custom.json'

export async function GET() {
  try {
    const services = await blobGet<Service[]>(BLOB_PATH, LOCAL_FILE, [])
    return NextResponse.json({
      success: true,
      services: services.length > 0 ? services : defaultServices,
      source: services.length > 0 ? 'storage' : 'default',
    })
  } catch (error) {
    console.error('Error reading services:', error)
    return NextResponse.json({ success: true, services: defaultServices, source: 'default' })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { services } = await request.json()

    if (!Array.isArray(services)) {
      return NextResponse.json(
        { success: false, error: 'Invalid data: services must be an array' },
        { status: 400 }
      )
    }

    await blobPut(BLOB_PATH, LOCAL_FILE, services)

    return NextResponse.json({
      success: true,
      message: 'Services saved successfully',
      count: services.length,
    })
  } catch (error) {
    console.error('Error saving services:', error)
    return NextResponse.json(
      { success: false, error: 'Error saving services' },
      { status: 500 }
    )
  }
}

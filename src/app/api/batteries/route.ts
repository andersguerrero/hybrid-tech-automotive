import { NextRequest, NextResponse } from 'next/server'
import { blobGet, blobPut } from '@/lib/storage'
import type { Battery } from '@/types'

const BLOB_PATH = 'config/batteries-custom.json'
const LOCAL_FILE = 'batteries-custom.json'

export async function GET() {
  try {
    const batteries = await blobGet<Battery[]>(BLOB_PATH, LOCAL_FILE, [])
    return NextResponse.json({
      success: true,
      batteries,
      source: batteries.length > 0 ? 'storage' : 'default',
    })
  } catch (error) {
    console.error('Error reading batteries:', error)
    return NextResponse.json(
      { success: false, error: 'Error al leer las baterías' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { batteries } = await request.json()

    if (!Array.isArray(batteries)) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos' },
        { status: 400 }
      )
    }

    await blobPut(BLOB_PATH, LOCAL_FILE, batteries)

    return NextResponse.json({
      success: true,
      message: 'Baterías guardadas correctamente',
      count: batteries.length,
    })
  } catch (error) {
    console.error('Error saving batteries:', error)
    return NextResponse.json(
      { success: false, error: 'Error al guardar las baterías' },
      { status: 500 }
    )
  }
}

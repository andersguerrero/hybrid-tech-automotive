import { NextResponse } from 'next/server'
import { batteries as initialBatteries } from '@/data/batteries'

export async function GET() {
  try {
    return NextResponse.json({ 
      success: true, 
      batteries: initialBatteries,
      count: initialBatteries.length
    })
  } catch (error) {
    console.error('Error loading initial batteries:', error)
    return NextResponse.json(
      { success: false, error: 'Error al cargar las baterías iniciales' },
      { status: 500 }
    )
  }
}

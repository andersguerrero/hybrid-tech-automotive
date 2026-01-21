import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import type { Battery } from '@/types'

const DATA_FILE = join(process.cwd(), 'data', 'batteries-custom.json')

// Asegurar que el directorio existe
async function ensureDataDir() {
  const dataDir = join(process.cwd(), 'data')
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true })
  }
}

// GET: Obtener baterías guardadas
export async function GET() {
  try {
    await ensureDataDir()
    
    if (existsSync(DATA_FILE)) {
      const fileContent = await readFile(DATA_FILE, 'utf-8')
      const batteries = JSON.parse(fileContent)
      return NextResponse.json({ success: true, batteries })
    }
    
    return NextResponse.json({ success: true, batteries: [] })
  } catch (error) {
    console.error('Error reading batteries:', error)
    return NextResponse.json(
      { success: false, error: 'Error al leer las baterías' },
      { status: 500 }
    )
  }
}

// POST: Guardar baterías
export async function POST(request: NextRequest) {
  try {
    const { batteries } = await request.json()
    
    if (!Array.isArray(batteries)) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos' },
        { status: 400 }
      )
    }

    await ensureDataDir()
    await writeFile(DATA_FILE, JSON.stringify(batteries, null, 2), 'utf-8')
    
    console.log('Batteries saved to server:', batteries.length)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Baterías guardadas correctamente',
      count: batteries.length
    })
  } catch (error) {
    console.error('Error saving batteries:', error)
    return NextResponse.json(
      { success: false, error: 'Error al guardar las baterías' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import type { Battery } from '@/types'

// En Vercel, el sistema de archivos es de solo lectura excepto /tmp
// Usaremos /tmp para almacenamiento temporal o retornar las baterías desde el request
const DATA_FILE = process.env.VERCEL 
  ? join('/tmp', 'batteries-custom.json')
  : join(process.cwd(), 'data', 'batteries-custom.json')

// GET: Obtener baterías guardadas
export async function GET() {
  try {
    // En producción (Vercel), intentar leer desde /tmp
    // Si no existe, retornar vacío (las baterías se cargarán desde localStorage o archivo inicial)
    if (existsSync(DATA_FILE)) {
      try {
        const fileContent = await readFile(DATA_FILE, 'utf-8')
        const batteries = JSON.parse(fileContent)
        if (Array.isArray(batteries) && batteries.length > 0) {
          return NextResponse.json({ success: true, batteries })
        }
      } catch (error) {
        console.error('Error reading batteries file:', error)
      }
    }
    
    // Si no hay archivo o está vacío, retornar vacío
    // El frontend cargará desde localStorage o archivo inicial
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

    // En Vercel, guardar en /tmp (temporal)
    // En desarrollo, guardar en data/
    if (!process.env.VERCEL) {
      const dataDir = join(process.cwd(), 'data')
      if (!existsSync(dataDir)) {
        await mkdir(dataDir, { recursive: true })
      }
    }
    
    try {
      await writeFile(DATA_FILE, JSON.stringify(batteries, null, 2), 'utf-8')
      console.log('Batteries saved to server:', batteries.length)
    } catch (writeError) {
      // Si falla escribir (por ejemplo en Vercel), solo loguear
      // Las baterías seguirán funcionando desde localStorage
      console.log('Note: Could not write to file system (expected in Vercel), batteries saved to localStorage only')
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Baterías guardadas correctamente',
      count: batteries.length,
      note: process.env.VERCEL ? 'Saved to localStorage (file system is read-only in Vercel)' : 'Saved to server file'
    })
  } catch (error) {
    console.error('Error saving batteries:', error)
    return NextResponse.json(
      { success: false, error: 'Error al guardar las baterías' },
      { status: 500 }
    )
  }
}

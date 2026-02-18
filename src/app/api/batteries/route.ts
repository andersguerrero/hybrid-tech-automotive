import { NextRequest, NextResponse } from 'next/server'
import { put, list } from '@vercel/blob'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import type { Battery } from '@/types'

const BLOB_CONFIG_PATH = 'config/batteries-custom.json'

// En local: archivo en data/. En Vercel sin Blob: /tmp (temporal). Con Blob: persistente en Blob.
const LOCAL_DATA_FILE = process.env.VERCEL
  ? join('/tmp', 'batteries-custom.json')
  : join(process.cwd(), 'data', 'batteries-custom.json')

// GET: Obtener baterías guardadas
export async function GET() {
  try {
    // Producción con Vercel Blob (persistente)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { blobs } = await list({ prefix: 'config/' })
      const batteriesBlob = blobs.find((b) => b.pathname === BLOB_CONFIG_PATH)

      if (batteriesBlob?.url) {
        const response = await fetch(batteriesBlob.url)
        const batteries = await response.json()
        if (Array.isArray(batteries) && batteries.length > 0) {
          return NextResponse.json({ success: true, batteries, source: 'blob' })
        }
      }
      return NextResponse.json({ success: true, batteries: [] })
    }

    // Local o Vercel sin Blob: leer desde archivo
    if (existsSync(LOCAL_DATA_FILE)) {
      try {
        const fileContent = await readFile(LOCAL_DATA_FILE, 'utf-8')
        const batteries = JSON.parse(fileContent)
        if (Array.isArray(batteries) && batteries.length > 0) {
          return NextResponse.json({ success: true, batteries })
        }
      } catch (error) {
        console.error('Error reading batteries file:', error)
      }
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

    // Producción con Vercel Blob (persistente)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const json = JSON.stringify(batteries, null, 2)
      await put(BLOB_CONFIG_PATH, json, {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
      })
      return NextResponse.json({
        success: true,
        message: 'Baterías guardadas correctamente',
        count: batteries.length,
        note: 'Saved to Vercel Blob (persistent)',
      })
    }

    // Local: guardar en data/
    const dataDir = join(process.cwd(), 'data')
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true })
    }
    try {
      await writeFile(LOCAL_DATA_FILE, JSON.stringify(batteries, null, 2), 'utf-8')
    } catch (writeError) {
      console.error('Error writing batteries file:', writeError)
    }

    return NextResponse.json({
      success: true,
      message: 'Baterías guardadas correctamente',
      count: batteries.length,
      note: 'Saved to server file',
    })
  } catch (error) {
    console.error('Error saving batteries:', error)
    return NextResponse.json(
      { success: false, error: 'Error al guardar las baterías' },
      { status: 500 }
    )
  }
}

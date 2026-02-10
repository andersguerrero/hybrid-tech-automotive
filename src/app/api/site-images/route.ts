import { NextRequest, NextResponse } from 'next/server'
import { put, list } from '@vercel/blob'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { siteImages as defaultSiteImages, type SiteImages } from '@/data/images'

const CONFIG_PATH = 'config/site-images.json'

// En localhost: archivo JSON. En Vercel: Blob.
const LOCAL_DATA_FILE = process.env.VERCEL
  ? join('/tmp', 'site-images-custom.json')
  : join(process.cwd(), 'data', 'site-images-custom.json')

// GET: Obtener configuración de imágenes
export async function GET() {
  try {
    // Producción con Blob
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { blobs } = await list({ prefix: 'config/' })
      const configBlob = blobs.find((b) => b.pathname === CONFIG_PATH)

      if (configBlob?.url) {
        const response = await fetch(configBlob.url)
        const siteImages: SiteImages = await response.json()
        return NextResponse.json({ success: true, siteImages, source: 'blob' })
      }
    }

    // Localhost: leer desde archivo
    if (existsSync(LOCAL_DATA_FILE)) {
      const content = await readFile(LOCAL_DATA_FILE, 'utf-8')
      const siteImages: SiteImages = JSON.parse(content)
      return NextResponse.json({ success: true, siteImages, source: 'file' })
    }

    return NextResponse.json({
      success: true,
      siteImages: defaultSiteImages,
      source: 'default',
    })
  } catch (error) {
    console.error('Error loading site images:', error)
    return NextResponse.json({
      success: true,
      siteImages: defaultSiteImages,
      source: 'default',
    })
  }
}

// POST: Guardar configuración de imágenes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const siteImages = body.siteImages ?? body

    if (!siteImages || typeof siteImages !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos' },
        { status: 400 }
      )
    }

    // Producción con Blob
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const json = JSON.stringify(siteImages, null, 2)
      await put(CONFIG_PATH, json, {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
      })
      return NextResponse.json({
        success: true,
        message: 'Configuración guardada en Vercel Blob',
      })
    }

    // Localhost: guardar en archivo
    const dataDir = join(process.cwd(), 'data')
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true })
    }
    await writeFile(
      LOCAL_DATA_FILE,
      JSON.stringify(siteImages, null, 2),
      'utf-8'
    )

    return NextResponse.json({
      success: true,
      message: 'Configuración guardada correctamente',
    })
  } catch (error) {
    console.error('Error saving site images:', error)
    return NextResponse.json(
      { success: false, error: 'Error al guardar la configuración' },
      { status: 500 }
    )
  }
}

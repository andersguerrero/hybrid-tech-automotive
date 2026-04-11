import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import logger from '@/lib/logger'

// Detect Railway environment reliably (Railway sets several env vars automatically)
const isRailway = !!(
  process.env.RAILWAY_ENVIRONMENT ||
  process.env.RAILWAY_ENVIRONMENT_NAME ||
  process.env.RAILWAY_SERVICE_NAME ||
  process.env.RAILWAY_PROJECT_ID
)

// Railway persistent volume path vs local dev
const UPLOADS_DIR = isRailway
  ? '/app/uploads'
  : join(process.cwd(), 'public', 'uploads')

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string
    const fileName = formData.get('fileName') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    if (!category || !fileName) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos: category y fileName son requeridos' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'El archivo es demasiado grande. Máximo 10MB.' },
        { status: 400 }
      )
    }

    // Usar Vercel Blob si está configurado
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const pathname = `images/${category}/${fileName}`
      const blob = await put(pathname, file, {
        access: 'public',
        addRandomSuffix: false,
      })

      return NextResponse.json({
        success: true,
        url: blob.url,
        message: 'Imagen subida correctamente a Vercel Blob',
      })
    }

    // Guardar en disco (Railway volume o local)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const uploadPath = join(UPLOADS_DIR, category)

    // Create directory if it doesn't exist
    if (!existsSync(uploadPath)) {
      try {
        await mkdir(uploadPath, { recursive: true })
      } catch (mkdirError) {
        const msg = mkdirError instanceof Error ? mkdirError.message : String(mkdirError)
        logger.error(`Cannot create upload directory ${uploadPath}: ${msg}`, mkdirError as Error)
        return NextResponse.json(
          { success: false, error: `No se pudo crear el directorio de uploads: ${msg}` },
          { status: 500 }
        )
      }
    }

    const finalPath = join(uploadPath, fileName)
    await writeFile(finalPath, buffer)

    // En Railway, servir via API route; en local, servir desde public/
    const publicUrl = isRailway
      ? `/api/uploads/${category}/${fileName}`
      : `/uploads/${category}/${fileName}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: 'Imagen subida correctamente',
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    logger.error('Error uploading image:', error as Error)
    return NextResponse.json(
      { success: false, error: `Error al subir la imagen: ${errorMsg}` },
      { status: 500 }
    )
  }
}

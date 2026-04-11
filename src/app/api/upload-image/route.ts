import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import logger from '@/lib/logger'

// Railway persistent volume path
const UPLOADS_DIR = process.env.RAILWAY_ENVIRONMENT
  ? '/app/public/uploads'
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

    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true })
    }

    const finalPath = join(uploadPath, fileName)
    await writeFile(finalPath, buffer)

    // En Railway, servir via API route; en local, servir desde public/
    const publicUrl = process.env.RAILWAY_ENVIRONMENT
      ? `/api/uploads/${category}/${fileName}`
      : `/uploads/${category}/${fileName}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: 'Imagen subida correctamente',
    })
  } catch (error) {
    logger.error('Error uploading image:', error as Error)
    return NextResponse.json(
      { success: false, error: 'Error al subir la imagen' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { execSync } from 'child_process'
import logger from '@/lib/logger'

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

    // Usar Vercel Blob si está configurado (producción / Vercel)
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

    // Fallback: guardar en disco (solo localhost, sin BLOB_READ_WRITE_TOKEN)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const uploadPath = join(process.cwd(), 'public', 'images', category)

    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true })
    }

    const finalPath = join(uploadPath, fileName)
    await writeFile(finalPath, buffer)

    // Intentar agregar a Git (solo en desarrollo local)
    try {
      if (!process.env.VERCEL) {
        const relativePath = `public/images/${category}/${fileName}`
        execSync(`git add "${relativePath}"`, {
          cwd: process.cwd(),
          stdio: 'ignore',
          timeout: 5000,
        })
      }
    } catch {
      // Ignorar errores de Git
    }

    const publicUrl = `/images/${category}/${fileName}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: 'Imagen subida correctamente (local)',
    })
  } catch (error) {
    logger.error('Error uploading image:', error as Error)
    return NextResponse.json(
      { success: false, error: 'Error al subir la imagen' },
      { status: 500 }
    )
  }
}

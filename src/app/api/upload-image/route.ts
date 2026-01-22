import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { execSync } from 'child_process'

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

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Determinar la ruta de guardado basada en la categoría
    const uploadPath = join(process.cwd(), 'public', 'images', category)
    
    // Crear directorio si no existe
    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true })
    }

    // Guardar el archivo
    const finalPath = join(uploadPath, fileName)
    await writeFile(finalPath, buffer)

    // Intentar agregar la imagen a Git automáticamente (solo en desarrollo local)
    // En producción (Vercel) esto no funcionará, pero está bien
    try {
      if (!process.env.VERCEL) {
        // Solo ejecutar en desarrollo local
        const relativePath = `public/images/${category}/${fileName}`
        execSync(`git add "${relativePath}"`, { 
          cwd: process.cwd(),
          stdio: 'ignore', // No mostrar output en la respuesta
          timeout: 5000 // Timeout de 5 segundos
        })
        console.log(`✅ Imagen agregada a Git: ${relativePath}`)
      }
    } catch (gitError) {
      // Si falla agregar a Git, no es crítico - solo loguear
      console.log('⚠️  No se pudo agregar la imagen a Git automáticamente (normal en producción):', gitError)
    }

    // Retornar la URL pública del archivo
    const publicUrl = `/images/${category}/${fileName}`

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      message: 'Imagen subida correctamente',
      note: process.env.VERCEL 
        ? 'Imagen guardada. Ejecuta "npm run sync-images" localmente para agregarla a Git.'
        : 'Imagen guardada y agregada a Git automáticamente.'
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { success: false, error: 'Error al subir la imagen' },
      { status: 500 }
    )
  }
}


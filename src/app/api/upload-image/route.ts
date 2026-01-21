import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

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

    // Retornar la URL pública del archivo
    const publicUrl = `/images/${category}/${fileName}`

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      message: 'Imagen subida correctamente' 
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { success: false, error: 'Error al subir la imagen' },
      { status: 500 }
    )
  }
}


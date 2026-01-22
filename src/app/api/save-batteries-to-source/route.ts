import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'
import type { Battery } from '@/types'

const BATTERIES_FILE = join(process.cwd(), 'src', 'data', 'batteries.ts')

export async function POST(request: NextRequest) {
  try {
    const { batteries } = await request.json()
    
    if (!Array.isArray(batteries)) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos' },
        { status: 400 }
      )
    }

    // Generar el contenido del archivo TypeScript
    const fileContent = `import { Battery } from '@/types'

export const batteries: Battery[] = [
${batteries.map((battery: Battery, index: number) => {
  const image = battery.image.replace(/"/g, '\\"')
  const vehicle = battery.vehicle.replace(/'/g, "\\'")
  const description = battery.description.replace(/'/g, "\\'")
  
  return `  { id: '${battery.id}', vehicle: '${vehicle}', batteryType: '${battery.batteryType}', condition: '${battery.condition}', price: ${battery.price}, warranty: '${battery.warranty}', image: '${image}', description: '${description}' }${index < batteries.length - 1 ? ',' : ''}`
}).join('\n')}
]
`

    // Guardar el archivo
    await writeFile(BATTERIES_FILE, fileContent, 'utf-8')
    
    console.log('Batteries saved to source file:', batteries.length)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Baterías guardadas en el archivo fuente',
      count: batteries.length
    })
  } catch (error: any) {
    console.error('Error saving batteries to source:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error al guardar las baterías' },
      { status: 500 }
    )
  }
}

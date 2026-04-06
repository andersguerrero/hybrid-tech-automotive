import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import type { Battery } from '@/types'
import { saveBatteriesSchema, formatZodError } from '@/lib/validations'
import logger from '@/lib/logger'

const BATTERIES_FILE = join(process.cwd(), 'src', 'data', 'batteries.ts')
const BATTERIES_JSON_FILE = join(process.cwd(), 'data', 'batteries-custom.json')

function escapeString(str: string): string {
  return str.replace(/'/g, "\\'").replace(/\n/g, '\\n')
}

function formatBattery(battery: Battery, index: number, total: number): string {
  const vehicle = escapeString(battery.vehicle)
  const batteryType = escapeString(battery.batteryType)
  const condition = battery.condition
  const price = battery.price
  const warranty = escapeString(battery.warranty)
  const image = battery.image.replace(/"/g, '\\"')
  const description = escapeString(battery.description)
  
  return `  { id: '${battery.id}', vehicle: '${vehicle}', batteryType: '${batteryType}', condition: '${condition}', price: ${price}, warranty: '${warranty}', image: '${image}', description: '${description}' }${index < total - 1 ? ',' : ''}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Zod validation (auth already checked by middleware)
    const parsed = saveBatteriesSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: formatZodError(parsed.error) },
        { status: 400 }
      )
    }

    const { batteries } = parsed.data

    // Siempre guardar en JSON primero (funciona en producción y desarrollo)
    try {
      await writeFile(BATTERIES_JSON_FILE, JSON.stringify(batteries, null, 2), 'utf-8')
      logger.info('Batteries saved to JSON file:', { data: batteries.length })
    } catch (jsonError) {
      logger.warn('Could not save to JSON file:', jsonError as Error)
    }

    // Intentar actualizar el archivo fuente (solo funciona en desarrollo local)
    try {
      const fileContent = `import { Battery } from '@/types'

export const batteries: Battery[] = [
${batteries.map((battery: Battery, index: number) => formatBattery(battery, index, batteries.length)).join('\n')}
]
`

      await writeFile(BATTERIES_FILE, fileContent, 'utf-8')
      logger.info('Batteries saved to source file:', { data: batteries.length })
      
      return NextResponse.json({ 
        success: true, 
        message: 'Baterías guardadas en el archivo fuente. Los cambios se reflejarán en el próximo despliegue.',
        count: batteries.length,
        savedToSource: true
      })
    } catch (sourceError: any) {
      // En producción esto fallará, pero está bien - guardamos en JSON
      logger.info('Could not save to source file (normal in production):', { data: sourceError.message })
      
      return NextResponse.json({ 
        success: true, 
        message: 'Baterías guardadas en JSON. Ejecuta "npm run sync-batteries" localmente para actualizar el archivo fuente.',
        count: batteries.length,
        savedToSource: false,
        savedToJson: true
      })
    }
  } catch (error: any) {
    logger.error('Error saving batteries to source:', error as Error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error al guardar las baterías' },
      { status: 500 }
    )
  }
}

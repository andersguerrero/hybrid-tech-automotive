import { NextResponse } from 'next/server'

// Este endpoint permite obtener las baterías desde localStorage del cliente
// Se usa desde una página especial que lee localStorage y las envía aquí
export async function GET() {
  // Este endpoint necesita ser llamado desde el cliente con las baterías
  // Por ahora retornamos un mensaje indicando cómo usarlo
  return NextResponse.json({ 
    message: 'Este endpoint debe ser llamado desde el cliente con las baterías',
    usage: 'Usa la página /admin/export-batteries para exportar'
  })
}

export async function POST(request: Request) {
  try {
    const { batteries } = await request.json()
    
    if (!Array.isArray(batteries)) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos' },
        { status: 400 }
      )
    }

    // Retornar las baterías para que puedan ser exportadas
    return NextResponse.json({ 
      success: true, 
      batteries,
      count: batteries.length
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al procesar las baterías' },
      { status: 500 }
    )
  }
}

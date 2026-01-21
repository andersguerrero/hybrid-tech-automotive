import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { services, batteries } = await request.json()

    // En una aplicación de producción, aquí guardarías los datos en una base de datos
    // Por ahora, solo validamos que los datos estén correctos y devolvemos éxito
    
    if (!services || !batteries) {
      return NextResponse.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Aquí se puede agregar lógica para guardar en base de datos
    // Por ejemplo: await db.prices.update({ services, batteries })
    
    console.log('Precios actualizados:', { services, batteries })

    return NextResponse.json({ success: true, message: 'Precios actualizados correctamente' })
  } catch (error) {
    console.error('Error updating prices:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar los precios' },
      { status: 500 }
    )
  }
}


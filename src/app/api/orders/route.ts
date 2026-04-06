import { NextRequest, NextResponse } from 'next/server'
import { getOrders, updateOrderStatus } from '@/lib/orders'
import { orderUpdateSchema, formatZodError } from '@/lib/validations'
import logger from '@/lib/logger'

export async function GET() {
  try {
    const orders = await getOrders()
    return NextResponse.json(orders)
  } catch (error) {
    logger.error('Error fetching orders:', error as Error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Zod validation (auth already checked by middleware)
    const parsed = orderUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      )
    }

    const { orderId, orderStatus, paymentStatus } = parsed.data

    const updated = await updateOrderStatus(orderId, { orderStatus, paymentStatus })

    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, order: updated })
  } catch (error) {
    logger.error('Error updating order:', error as Error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

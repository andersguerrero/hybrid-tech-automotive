import { NextRequest, NextResponse } from 'next/server'
import { getOrders, updateOrderStatus } from '@/lib/orders'

export async function GET() {
  try {
    const orders = await getOrders()
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, orderStatus, paymentStatus } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    const updated = await updateOrderStatus(orderId, { orderStatus, paymentStatus })

    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, order: updated })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

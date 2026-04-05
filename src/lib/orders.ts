import { blobGet, blobPut } from './storage'
import type { Order } from '@/types'

const BLOB_PATH = 'config/orders.json'
const LOCAL_FILE = 'orders.json'

export async function getOrders(): Promise<Order[]> {
  return blobGet<Order[]>(BLOB_PATH, LOCAL_FILE, [])
}

export async function saveOrders(orders: Order[]): Promise<void> {
  return blobPut(BLOB_PATH, LOCAL_FILE, orders)
}

export async function createOrder(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
  const orders = await getOrders()
  const now = new Date().toISOString()
  const order: Order = {
    ...data,
    id: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  }
  orders.unshift(order)
  await saveOrders(orders)
  return order
}

export async function updateOrderStatus(
  orderId: string,
  updates: Partial<Pick<Order, 'orderStatus' | 'paymentStatus'>>
): Promise<Order | null> {
  const orders = await getOrders()
  const index = orders.findIndex((o) => o.id === orderId)
  if (index === -1) return null

  orders[index] = {
    ...orders[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  await saveOrders(orders)
  return orders[index]
}

export async function getOrdersByEmail(email: string): Promise<Order[]> {
  const orders = await getOrders()
  return orders.filter((o) => o.customerEmail.toLowerCase() === email.toLowerCase())
}

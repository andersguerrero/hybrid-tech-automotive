import { batteries as staticBatteries } from '@/data/batteries'
import { services as staticServices } from '@/data/services'
import { blobGet } from '@/lib/storage'
import type { Battery } from '@/types'
import logger from '@/lib/logger'

interface CartItemInput {
  id: string
  type: 'battery' | 'service'
  quantity: number
}

interface ValidatedLineItem {
  price_data: {
    currency: string
    product_data: {
      name: string
      description: string
    }
    unit_amount: number
  }
  quantity: number
}

async function loadCustomBatteries(): Promise<Battery[]> {
  try {
    return await blobGet<Battery[]>('config/batteries-custom.json', 'batteries-custom.json', [])
  } catch (error) {
    logger.error('Error loading custom batteries:', error as Error)
    return []
  }
}

export async function getItemPrice(itemId: string, itemType: 'battery' | 'service'): Promise<{ price: number; name: string; description: string } | null> {
  if (itemType === 'battery') {
    // Use DB data when PostgreSQL is configured; otherwise fallback to static
    const customBatteries = await loadCustomBatteries()
    const allBatteries = process.env.DATABASE_URL
      ? customBatteries
      : (customBatteries.length > 0 ? customBatteries : staticBatteries)

    const battery = allBatteries.find(b => b.id === itemId)
    if (battery) {
      return {
        price: battery.price,
        name: `${battery.vehicle} - ${battery.batteryType}`,
        description: battery.description,
      }
    }
  }

  if (itemType === 'service') {
    const customServices = await blobGet<typeof staticServices>('config/services-custom.json', 'services-custom.json', [])
    const allServices = process.env.DATABASE_URL
      ? customServices
      : (customServices.length > 0 ? customServices : staticServices)
    const service = allServices.find(s => s.id === itemId)
    if (service) {
      return {
        price: service.price,
        name: service.name,
        description: service.description,
      }
    }
  }

  return null
}

export async function validateCartItems(items: CartItemInput[]): Promise<{ lineItems: ValidatedLineItem[]; subtotal: number } | { error: string }> {
  const lineItems: ValidatedLineItem[] = []
  let subtotal = 0

  for (const item of items) {
    if (!item.id || !item.type || !item.quantity || item.quantity < 1 || item.quantity > 100) {
      return { error: `Invalid item: ${JSON.stringify(item)}` }
    }

    const priceInfo = await getItemPrice(item.id, item.type)
    if (!priceInfo) {
      return { error: `Item not found: ${item.type} with id ${item.id}` }
    }

    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: priceInfo.name,
          description: priceInfo.description,
        },
        unit_amount: Math.round(priceInfo.price * 100),
      },
      quantity: item.quantity,
    })

    subtotal += priceInfo.price * item.quantity
  }

  return { lineItems, subtotal }
}

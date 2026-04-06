import { NextRequest, NextResponse } from 'next/server'
import { blobGet, blobPut } from '@/lib/storage'
import { batteries as staticBatteries } from '@/data/batteries'
import { recordAllPrices, getPriceHistory } from '@/lib/priceHistory'
import type { Battery } from '@/types'
import logger from '@/lib/logger'

const BLOB_PATH = 'config/batteries-custom.json'
const LOCAL_FILE = 'batteries-custom.json'

/**
 * GET /api/batteries
 *
 * Query params (all optional):
 *   q        - Full-text search across vehicle, batteryType, description
 *   brand    - Filter by brand prefix (e.g., "Toyota", "Lexus")
 *   model    - Filter by model name (e.g., "Prius", "Camry")
 *   condition - Filter by condition ("new" | "refurbished")
 *   minPrice - Minimum price filter
 *   maxPrice - Maximum price filter
 *   page     - Page number (default: 1)
 *   limit    - Items per page (default: 12, max: 100, 0 = all)
 *   sort     - Sort field: "price", "vehicle", "condition" (default: "vehicle")
 *   order    - Sort order: "asc" | "desc" (default: "asc")
 */
export async function GET(request: NextRequest) {
  try {
    // Load batteries from storage; only fallback to static data when no DB is configured
    const storedBatteries = await blobGet<Battery[]>(BLOB_PATH, LOCAL_FILE, [])
    const allBatteries = process.env.DATABASE_URL
      ? storedBatteries
      : (storedBatteries.length > 0 ? storedBatteries : staticBatteries)

    const params = request.nextUrl.searchParams

    // Parse query parameters
    const q = params.get('q')?.toLowerCase().trim() || ''
    const brand = params.get('brand')?.trim() || ''
    const model = params.get('model')?.trim() || ''
    const condition = params.get('condition')?.trim() || ''
    const minPrice = parseFloat(params.get('minPrice') || '0') || 0
    const maxPrice = parseFloat(params.get('maxPrice') || '0') || 0
    const page = Math.max(1, parseInt(params.get('page') || '1') || 1)
    const rawLimit = parseInt(params.get('limit') || '12') || 12
    const limit = rawLimit === 0 ? 0 : Math.min(Math.max(1, rawLimit), 100)
    const sort = params.get('sort') || 'vehicle'
    const order = params.get('order') === 'desc' ? 'desc' : 'asc'

    // Filter batteries
    let filtered = allBatteries.filter((battery) => {
      // Full-text search
      if (q) {
        const searchTarget = `${battery.vehicle} ${battery.batteryType} ${battery.description}`.toLowerCase()
        const terms = q.split(/\s+/)
        if (!terms.every((term) => searchTarget.includes(term))) {
          return false
        }
      }

      // Brand filter
      if (brand && !battery.vehicle.toLowerCase().startsWith(brand.toLowerCase())) {
        return false
      }

      // Model filter
      if (model) {
        const match = battery.vehicle.match(/^\w+\s+(.+?)\s*\(/)
        if (!match || match[1].toLowerCase() !== model.toLowerCase()) {
          return false
        }
      }

      // Condition filter
      if (condition && battery.condition !== condition) {
        return false
      }

      // Price range filter
      if (minPrice > 0 && battery.price < minPrice) {
        return false
      }
      if (maxPrice > 0 && battery.price > maxPrice) {
        return false
      }

      return true
    })

    // Sort
    filtered.sort((a, b) => {
      let cmp = 0
      switch (sort) {
        case 'price':
          cmp = a.price - b.price
          break
        case 'condition':
          cmp = a.condition.localeCompare(b.condition)
          break
        default:
          cmp = a.vehicle.localeCompare(b.vehicle)
      }
      return order === 'desc' ? -cmp : cmp
    })

    const total = filtered.length

    // Extract unique facets for filter UI
    const brandSet = new Set<string>()
    const modelSet = new Set<string>()
    const conditionSet = new Set<string>()

    allBatteries.forEach((b) => {
      const brandMatch = b.vehicle.match(/^(\w+)/)
      if (brandMatch) brandSet.add(brandMatch[1])
      conditionSet.add(b.condition)
    })

    const modelSource = brand
      ? allBatteries.filter((b) => b.vehicle.toLowerCase().startsWith(brand.toLowerCase()))
      : allBatteries
    modelSource.forEach((b) => {
      const match = b.vehicle.match(/^\w+\s+(.+?)\s*\(/)
      if (match) modelSet.add(match[1])
    })

    const facets = {
      brands: Array.from(brandSet).sort(),
      models: Array.from(modelSet).sort(),
      conditions: Array.from(conditionSet).sort(),
      priceRange: {
        min: Math.min(...allBatteries.map((b) => b.price)),
        max: Math.max(...allBatteries.map((b) => b.price)),
      },
    }

    // Paginate (limit=0 means return all)
    let batteries: Battery[]
    let totalPages: number

    if (limit === 0) {
      batteries = filtered
      totalPages = 1
    } else {
      totalPages = Math.ceil(total / limit)
      const offset = (page - 1) * limit
      batteries = filtered.slice(offset, offset + limit)
    }

    // Price history: only fetch (don't record on every GET — recording
    // should happen only when prices are actually updated via POST/PUT)
    const previousPrices: Record<string, number> = {}
    try {
      const priceHistory = await getPriceHistory()
      batteries.forEach(b => {
        const records = priceHistory
          .filter(r => r.batteryId === b.id && r.price !== b.price)
          .sort((a, c) => c.date.localeCompare(a.date))
        if (records.length > 0) {
          previousPrices[b.id] = records[0].price
        }
      })
    } catch {
      // Price history is non-critical; continue without it
    }

    return NextResponse.json({
      success: true,
      batteries,
      previousPrices,
      pagination: {
        page,
        limit: limit || total,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      facets,
      source: storedBatteries.length > 0 ? 'storage' : 'default',
    })
  } catch (error) {
    logger.error('Error reading batteries:', error as Error)
    return NextResponse.json(
      { success: false, error: 'Error al leer las baterías' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { batteries } = await request.json()

    if (!Array.isArray(batteries)) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos' },
        { status: 400 }
      )
    }

    await blobPut(BLOB_PATH, LOCAL_FILE, batteries)

    // Record price history when batteries are saved (not on every GET)
    recordAllPrices(batteries.map((b: Battery) => ({ id: b.id, price: b.price }))).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Baterías guardadas correctamente',
      count: batteries.length,
    })
  } catch (error) {
    logger.error('Error saving batteries:', error as Error)
    return NextResponse.json(
      { success: false, error: 'Error al guardar las baterías' },
      { status: 500 }
    )
  }
}

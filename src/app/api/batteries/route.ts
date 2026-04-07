import { NextRequest, NextResponse } from 'next/server'
import { blobGet, blobPut } from '@/lib/storage'
import { batteries as staticBatteries } from '@/data/batteries'
import { recordAllPrices } from '@/lib/priceHistory'
import type { Battery } from '@/types'
import logger from '@/lib/logger'

const BLOB_PATH = 'config/batteries-custom.json'
const LOCAL_FILE = 'batteries-custom.json'

// ─── In-memory cache ─────────────────────────────────────────────────────────
// Avoids hitting the DB on every request. Cache lives for 60 seconds.
let cachedBatteries: Battery[] | null = null
let cacheTimestamp = 0
const CACHE_TTL = 60_000 // 60 seconds

async function getCachedBatteries(): Promise<Battery[]> {
  const now = Date.now()
  if (cachedBatteries && now - cacheTimestamp < CACHE_TTL) {
    return cachedBatteries
  }

  const storedBatteries = await blobGet<Battery[]>(BLOB_PATH, LOCAL_FILE, [])
  const allBatteries = process.env.DATABASE_URL
    ? storedBatteries
    : (storedBatteries.length > 0 ? storedBatteries : staticBatteries)

  cachedBatteries = allBatteries
  cacheTimestamp = now
  return allBatteries
}

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
    // Load batteries from cache (hits DB at most once per 60s)
    const allBatteries = await getCachedBatteries()

    const params = request.nextUrl.searchParams

    // Parse query parameters
    const q = params.get('q')?.toLowerCase().trim() || ''
    const brand = params.get('brand')?.trim() || ''
    const model = params.get('model')?.trim() || ''
    const condition = params.get('condition')?.trim() || ''
    const minPrice = parseFloat(params.get('minPrice') || '0') || 0
    const maxPrice = parseFloat(params.get('maxPrice') || '0') || 0
    const minYear = parseInt(params.get('minYear') || '0') || 0
    const maxYear = parseInt(params.get('maxYear') || '0') || 0
    const page = Math.max(1, parseInt(params.get('page') || '1') || 1)
    const limitStr = params.get('limit')
    const rawLimit = limitStr !== null ? parseInt(limitStr) : 12
    const limit = rawLimit === 0 ? 0 : Math.min(Math.max(1, isNaN(rawLimit) ? 12 : rawLimit), 100)
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

      // Year range filter — parse year from vehicle name e.g. "Toyota Prius (2004)"
      if (minYear > 0 || maxYear > 0) {
        const yearMatch = battery.vehicle.match(/\((\d{4})\)/)
        if (yearMatch) {
          const year = parseInt(yearMatch[1])
          if (minYear > 0 && year < minYear) return false
          if (maxYear > 0 && year > maxYear) return false
        }
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
        case 'year': {
          const yearA = parseInt(a.vehicle.match(/\((\d{4})\)/)?.[1] || '0')
          const yearB = parseInt(b.vehicle.match(/\((\d{4})\)/)?.[1] || '0')
          cmp = yearA - yearB
          break
        }
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

    // Extract years from all batteries
    const years = allBatteries
      .map((b) => {
        const m = b.vehicle.match(/\((\d{4})\)/)
        return m ? parseInt(m[1]) : null
      })
      .filter((y): y is number => y !== null)

    const facets = {
      brands: Array.from(brandSet).sort(),
      models: Array.from(modelSet).sort(),
      conditions: Array.from(conditionSet).sort(),
      priceRange: {
        min: Math.min(...allBatteries.map((b) => b.price)),
        max: Math.max(...allBatteries.map((b) => b.price)),
      },
      yearRange: {
        min: years.length > 0 ? Math.min(...years) : 2000,
        max: years.length > 0 ? Math.max(...years) : 2025,
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

    return NextResponse.json({
      success: true,
      batteries,
      pagination: {
        page,
        limit: limit || total,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      facets,
      source: allBatteries.length > 0 ? 'storage' : 'default',
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

    // Invalidate cache so next GET picks up the new data
    cachedBatteries = null
    cacheTimestamp = 0

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

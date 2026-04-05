import { NextRequest, NextResponse } from 'next/server'
import { blobGet, blobPut } from '@/lib/storage'
import { batteries as staticBatteries } from '@/data/batteries'
import type { Battery } from '@/types'

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
    // Load batteries from storage or fallback to static data
    const storedBatteries = await blobGet<Battery[]>(BLOB_PATH, LOCAL_FILE, [])
    const allBatteries = storedBatteries.length > 0 ? storedBatteries : staticBatteries

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
        const match = battery.vehicle.match(/^(?:Toyota|Lexus)\s+(.+?)\s*\(/)
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
      const brandMatch = b.vehicle.match(/^(Toyota|Lexus)/)
      if (brandMatch) brandSet.add(brandMatch[1])
      conditionSet.add(b.condition)
    })

    const modelSource = brand
      ? allBatteries.filter((b) => b.vehicle.toLowerCase().startsWith(brand.toLowerCase()))
      : allBatteries
    modelSource.forEach((b) => {
      const match = b.vehicle.match(/^(?:Toyota|Lexus)\s+(.+?)\s*\(/)
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
      source: storedBatteries.length > 0 ? 'storage' : 'default',
    })
  } catch (error) {
    console.error('Error reading batteries:', error)
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

    return NextResponse.json({
      success: true,
      message: 'Baterías guardadas correctamente',
      count: batteries.length,
    })
  } catch (error) {
    console.error('Error saving batteries:', error)
    return NextResponse.json(
      { success: false, error: 'Error al guardar las baterías' },
      { status: 500 }
    )
  }
}

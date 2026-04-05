import { NextRequest, NextResponse } from 'next/server'
import { blobGet, blobPut } from '@/lib/storage'
import type { Coupon } from '@/types'

const BLOB_PATH = 'config/coupons.json'
const LOCAL_FILE = 'coupons.json'

export async function GET() {
  try {
    const coupons = await blobGet<Coupon[]>(BLOB_PATH, LOCAL_FILE, [])
    return NextResponse.json(coupons)
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.action === 'delete' && body.id) {
      const coupons = await blobGet<Coupon[]>(BLOB_PATH, LOCAL_FILE, [])
      const filtered = coupons.filter(c => c.id !== body.id)
      await blobPut(BLOB_PATH, LOCAL_FILE, filtered)
      return NextResponse.json({ success: true })
    }

    const coupons = await blobGet<Coupon[]>(BLOB_PATH, LOCAL_FILE, [])
    const now = new Date().toISOString()

    if (body.id) {
      // Update existing coupon
      const idx = coupons.findIndex(c => c.id === body.id)
      if (idx === -1) {
        return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
      }
      coupons[idx] = { ...coupons[idx], ...body, updatedAt: now }
    } else {
      // Create new coupon
      const newCoupon: Coupon = {
        id: `coupon-${Date.now()}`,
        code: body.code.toUpperCase().trim(),
        type: body.type || 'percentage',
        value: Number(body.value),
        minPurchase: body.minPurchase ? Number(body.minPurchase) : 0,
        maxUses: body.maxUses ? Number(body.maxUses) : 0,
        usedCount: 0,
        isActive: true,
        expiresAt: body.expiresAt || null,
        description: body.description || '',
        createdAt: now,
        updatedAt: now,
      }

      // Check for duplicate code
      if (coupons.some(c => c.code === newCoupon.code)) {
        return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })
      }

      coupons.push(newCoupon)
    }

    await blobPut(BLOB_PATH, LOCAL_FILE, coupons)
    return NextResponse.json({ success: true, coupons })
  } catch (error) {
    console.error('Error saving coupon:', error)
    return NextResponse.json({ error: 'Failed to save coupon' }, { status: 500 })
  }
}

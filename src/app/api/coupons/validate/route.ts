import { NextRequest, NextResponse } from 'next/server'
import { blobGet } from '@/lib/storage'
import type { Coupon } from '@/types'

const BLOB_PATH = 'config/coupons.json'
const LOCAL_FILE = 'coupons.json'

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 })
    }

    const coupons = await blobGet<Coupon[]>(BLOB_PATH, LOCAL_FILE, [])
    const coupon = coupons.find(c => c.code === code.toUpperCase().trim())

    if (!coupon) {
      return NextResponse.json({ valid: false, error: 'Coupon not found' })
    }

    if (!coupon.isActive) {
      return NextResponse.json({ valid: false, error: 'Coupon is no longer active' })
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Coupon has expired' })
    }

    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: 'Coupon usage limit reached' })
    }

    if (coupon.minPurchase > 0 && subtotal < coupon.minPurchase) {
      return NextResponse.json({
        valid: false,
        error: `Minimum purchase of $${coupon.minPurchase.toFixed(2)} required`,
      })
    }

    // Calculate discount
    let discount = 0
    if (coupon.type === 'percentage') {
      discount = (subtotal * coupon.value) / 100
    } else {
      discount = Math.min(coupon.value, subtotal)
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        description: coupon.description,
      },
      discount: Math.round(discount * 100) / 100,
    })
  } catch (error) {
    console.error('Error validating coupon:', error)
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 })
  }
}

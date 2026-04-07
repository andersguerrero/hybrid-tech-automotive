/**
 * Tests for the server-side price validation utility
 */
import { getItemPrice, validateCartItems } from '@/lib/prices'

// Mock blob storage so it falls back to static data
jest.mock('@vercel/blob', () => ({
  list: jest.fn().mockResolvedValue({ blobs: [] }),
  put: jest.fn(),
}))

// Ensure BLOB_READ_WRITE_TOKEN is not set so we use static data
delete process.env.BLOB_READ_WRITE_TOKEN

describe('getItemPrice', () => {
  it('returns price info for a known battery', async () => {
    const result = await getItemPrice('1', 'battery')
    expect(result).not.toBeNull()
    expect(result!.price).toBe(899)
    expect(result!.name).toContain('Toyota Prius')
  })

  it('returns price info for a known service', async () => {
    const result = await getItemPrice('1', 'service')
    expect(result).not.toBeNull()
    expect(result!.price).toBe(85)
    expect(result!.name).toBe('Suspension Inspection')
  })

  it('returns null for an unknown battery id', async () => {
    const result = await getItemPrice('9999', 'battery')
    expect(result).toBeNull()
  })

  it('returns null for an unknown service id', async () => {
    const result = await getItemPrice('9999', 'service')
    expect(result).toBeNull()
  })
})

describe('validateCartItems', () => {
  it('validates a single battery item', async () => {
    const result = await validateCartItems([
      { id: '1', type: 'battery', quantity: 1 },
    ])

    expect('error' in result).toBe(false)
    if (!('error' in result)) {
      expect(result.lineItems).toHaveLength(1)
      expect(result.subtotal).toBe(899)
      expect(result.lineItems[0].price_data.unit_amount).toBe(89900) // cents
    }
  })

  it('validates multiple items and computes correct subtotal', async () => {
    const result = await validateCartItems([
      { id: '1', type: 'battery', quantity: 1 },
      { id: '1', type: 'service', quantity: 2 },
    ])

    expect('error' in result).toBe(false)
    if (!('error' in result)) {
      expect(result.lineItems).toHaveLength(2)
      expect(result.subtotal).toBe(899 + 85 * 2) // 1069
    }
  })

  it('returns error for invalid item (missing id)', async () => {
    const result = await validateCartItems([
      { id: '', type: 'battery', quantity: 1 },
    ])

    expect('error' in result).toBe(true)
  })

  it('returns error for invalid quantity (zero)', async () => {
    const result = await validateCartItems([
      { id: '1', type: 'battery', quantity: 0 },
    ])

    expect('error' in result).toBe(true)
  })

  it('returns error for invalid quantity (negative)', async () => {
    const result = await validateCartItems([
      { id: '1', type: 'battery', quantity: -1 },
    ])

    expect('error' in result).toBe(true)
  })

  it('returns error for item not found', async () => {
    const result = await validateCartItems([
      { id: '9999', type: 'battery', quantity: 1 },
    ])

    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error).toContain('not found')
    }
  })
})

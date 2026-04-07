/**
 * @jest-environment node
 *
 * Tests for GET /api/batteries
 */
import { GET } from '@/app/api/batteries/route'

// Mock the storage module
jest.mock('@/lib/storage', () => ({
  blobGet: jest.fn(),
  blobPut: jest.fn(),
}))

import { blobGet } from '@/lib/storage'

const mockedBlobGet = blobGet as jest.MockedFunction<typeof blobGet>

describe('/api/batteries GET', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns success with batteries from storage', async () => {
    const fakeBatteries = [
      { id: '1', vehicle: 'Toyota Prius (2010)', batteryType: 'Rebuilt NiMH', condition: 'refurbished', price: 899, warranty: '6 months', image: '/img.webp', description: 'Test battery' },
    ]
    mockedBlobGet.mockResolvedValue(fakeBatteries)

    const res = await GET()
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.batteries).toEqual(fakeBatteries)
    expect(data.source).toBe('storage')
  })

  it('returns success with empty array when no batteries stored', async () => {
    mockedBlobGet.mockResolvedValue([])

    const res = await GET()
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.batteries).toEqual([])
    expect(data.source).toBe('default')
  })

  it('returns 500 when storage throws an error', async () => {
    mockedBlobGet.mockRejectedValue(new Error('Storage failure'))

    const res = await GET()
    const data = await res.json()

    expect(res.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBeTruthy()
  })
})

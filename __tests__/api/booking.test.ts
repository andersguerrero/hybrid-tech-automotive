/**
 * @jest-environment node
 *
 * Tests for POST /api/booking
 */
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/booking/route'

// Mock email and orders modules
jest.mock('@/lib/email', () => ({
  sendBookingEmails: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/lib/orders', () => ({
  createOrder: jest.fn().mockResolvedValue({ id: 'ORD-TEST-123' }),
}))

import { sendBookingEmails } from '@/lib/email'
import { createOrder } from '@/lib/orders'

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/booking', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('/api/booking POST', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates a booking with valid data', async () => {
    const body = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '832-555-1234',
      service: 'Battery Replacement',
      date: '2024-02-01',
      time: '10:00',
      comments: 'Prius battery',
      paymentMethod: 'cash',
    }

    const res = await POST(makeRequest(body))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toContain('booked successfully')
    expect(createOrder).toHaveBeenCalledTimes(1)
  })

  it('returns 400 when required fields are missing', async () => {
    const body = {
      name: 'Jane Smith',
      // missing email, phone, date, time
    }

    const res = await POST(makeRequest(body))
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error).toBe('Missing required fields')
  })

  it('returns 400 when email is missing', async () => {
    const body = {
      name: 'Jane Smith',
      phone: '832-555-1234',
      date: '2024-02-01',
      time: '10:00',
    }

    const res = await POST(makeRequest(body))
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error).toBe('Missing required fields')
  })

  it('handles cart items in the booking', async () => {
    const body = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '832-555-1234',
      date: '2024-02-01',
      time: '10:00',
      cartItems: [
        { id: 'battery-1', name: 'Prius Battery', price: 899, quantity: 1, type: 'battery' },
      ],
      subtotal: 899,
      tax: 74.17,
      total: 973.17,
      paymentMethod: 'cash',
    }

    const res = await POST(makeRequest(body))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        items: expect.arrayContaining([
          expect.objectContaining({ name: 'Prius Battery', price: 899 }),
        ]),
      })
    )
  })

  it('sends booking emails after successful creation', async () => {
    const body = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '832-555-1234',
      service: 'Battery Replacement',
      date: '2024-02-01',
      time: '10:00',
    }

    await POST(makeRequest(body))

    expect(sendBookingEmails).toHaveBeenCalledWith(
      expect.objectContaining({
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
      })
    )
  })
})

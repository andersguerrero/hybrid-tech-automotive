/**
 * @jest-environment node
 *
 * Tests for POST /api/contact
 */
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/contact/route'

// Mock email module
jest.mock('@/lib/email', () => ({
  sendContactForm: jest.fn().mockResolvedValue(undefined),
}))

import { sendContactForm } from '@/lib/email'

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/contact', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('/api/contact POST', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('processes a valid contact form submission', async () => {
    const body = {
      name: 'Bob Johnson',
      email: 'bob@example.com',
      phone: '832-555-5678',
      subject: 'Battery inquiry',
      message: 'I need a quote for a Prius battery replacement.',
    }

    const res = await POST(makeRequest(body))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBeTruthy()
  })

  it('returns 400 when name is missing', async () => {
    const body = {
      email: 'bob@example.com',
      subject: 'Inquiry',
      message: 'Hello',
    }

    const res = await POST(makeRequest(body))
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('returns 400 when email is missing', async () => {
    const body = {
      name: 'Bob',
      subject: 'Inquiry',
      message: 'Hello',
    }

    const res = await POST(makeRequest(body))
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('returns 400 when subject is missing', async () => {
    const body = {
      name: 'Bob',
      email: 'bob@example.com',
      message: 'Hello',
    }

    const res = await POST(makeRequest(body))
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('returns 400 when message is missing', async () => {
    const body = {
      name: 'Bob',
      email: 'bob@example.com',
      subject: 'Inquiry',
    }

    const res = await POST(makeRequest(body))
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('sends contact email when submission is valid', async () => {
    const body = {
      name: 'Bob Johnson',
      email: 'bob@example.com',
      phone: '832-555-5678',
      subject: 'Battery inquiry',
      message: 'I need a quote.',
    }

    await POST(makeRequest(body))

    expect(sendContactForm).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Bob Johnson',
        email: 'bob@example.com',
        subject: 'Battery inquiry',
      })
    )
  })

  it('handles missing phone gracefully', async () => {
    const body = {
      name: 'Bob Johnson',
      email: 'bob@example.com',
      subject: 'Question',
      message: 'Just a question.',
    }

    const res = await POST(makeRequest(body))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
  })
})

import {
  contactFormSchema,
  bookingFormSchema,
  orderLookupSchema,
  orderUpdateSchema,
  loginSchema,
  formatZodError,
} from '../validations'

describe('contactFormSchema', () => {
  it('should accept valid data', () => {
    const result = contactFormSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test subject',
      message: 'Hello, I need help.',
    })
    expect(result.success).toBe(true)
  })

  it('should reject missing name', () => {
    const result = contactFormSchema.safeParse({
      email: 'john@example.com',
      subject: 'Test',
      message: 'Hello',
    })
    expect(result.success).toBe(false)
  })

  it('should reject invalid email', () => {
    const result = contactFormSchema.safeParse({
      name: 'John',
      email: 'not-an-email',
      subject: 'Test',
      message: 'Hello',
    })
    expect(result.success).toBe(false)
  })

  it('should reject too-long subject', () => {
    const result = contactFormSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      subject: 'x'.repeat(201),
      message: 'Hello',
    })
    expect(result.success).toBe(false)
  })

  it('should accept optional phone', () => {
    const result = contactFormSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      subject: 'Test',
      message: 'Hello',
      phone: '832-762-5299',
    })
    expect(result.success).toBe(true)
  })
})

describe('bookingFormSchema', () => {
  const validBooking = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '(832) 762-5299',
    date: '2026-04-10',
    time: '10:00 AM',
  }

  it('should accept valid booking', () => {
    const result = bookingFormSchema.safeParse(validBooking)
    expect(result.success).toBe(true)
  })

  it('should accept booking with cart items', () => {
    const result = bookingFormSchema.safeParse({
      ...validBooking,
      cartItems: [
        { name: 'Battery', price: 799, quantity: 1, type: 'battery' },
      ],
      subtotal: 799,
      tax: 65.92,
      total: 864.92,
      paymentMethod: 'stripe',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid payment method', () => {
    const result = bookingFormSchema.safeParse({
      ...validBooking,
      paymentMethod: 'bitcoin',
    })
    expect(result.success).toBe(false)
  })

  it('should reject missing date', () => {
    const { date, ...noDate } = validBooking
    const result = bookingFormSchema.safeParse(noDate)
    expect(result.success).toBe(false)
  })

  it('should reject invalid phone', () => {
    const result = bookingFormSchema.safeParse({
      ...validBooking,
      phone: 'abc',
    })
    expect(result.success).toBe(false)
  })
})

describe('orderLookupSchema', () => {
  it('should accept valid email', () => {
    const result = orderLookupSchema.safeParse({ email: 'user@test.com' })
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const result = orderLookupSchema.safeParse({ email: 'not-email' })
    expect(result.success).toBe(false)
  })

  it('should reject empty object', () => {
    const result = orderLookupSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('orderUpdateSchema', () => {
  it('should accept valid status update', () => {
    const result = orderUpdateSchema.safeParse({
      orderId: 'ORD-123',
      orderStatus: 'confirmed',
    })
    expect(result.success).toBe(true)
  })

  it('should accept payment status update', () => {
    const result = orderUpdateSchema.safeParse({
      orderId: 'ORD-123',
      paymentStatus: 'paid',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid order status', () => {
    const result = orderUpdateSchema.safeParse({
      orderId: 'ORD-123',
      orderStatus: 'shipped',
    })
    expect(result.success).toBe(false)
  })

  it('should reject missing orderId', () => {
    const result = orderUpdateSchema.safeParse({
      orderStatus: 'confirmed',
    })
    expect(result.success).toBe(false)
  })
})

describe('loginSchema', () => {
  it('should accept valid password', () => {
    const result = loginSchema.safeParse({ password: 'MyPassword123' })
    expect(result.success).toBe(true)
  })

  it('should reject empty password', () => {
    const result = loginSchema.safeParse({ password: '' })
    expect(result.success).toBe(false)
  })

  it('should reject too-long password', () => {
    const result = loginSchema.safeParse({ password: 'x'.repeat(129) })
    expect(result.success).toBe(false)
  })
})

describe('formatZodError', () => {
  it('should format errors with paths', () => {
    const result = contactFormSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const msg = formatZodError(result.error)
      expect(msg).toContain('email')
      expect(msg.length).toBeGreaterThan(0)
    }
  })
})

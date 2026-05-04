/**
 * Zod validation schemas for all API route inputs
 * Validates structure, types, and constraints before processing
 */

import { z } from 'zod'

// ==========================================
// Shared field validators
// ==========================================

const emailField = z
  .string()
  .email('Invalid email address')
  .max(254, 'Email too long')

const phoneField = z
  .string()
  .min(7, 'Phone number too short')
  .max(20, 'Phone number too long')
  .regex(/^[\d+\-() .]+$/, 'Invalid phone number format')

const nameField = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')

// ==========================================
// Contact Form
// ==========================================

export const contactFormSchema = z.object({
  name: nameField,
  email: emailField,
  phone: z.string().max(20).optional().default(''),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(200, 'Subject too long'),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(5000, 'Message too long'),
})

export type ContactFormInput = z.infer<typeof contactFormSchema>

// ==========================================
// Booking Form
// ==========================================

const cartItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(200),
  price: z.number().min(0).max(100000),
  quantity: z.number().int().min(1).max(100),
  type: z.enum(['service', 'battery']).optional().default('service'),
})

export const bookingFormSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  service: z.string().max(500).optional(),
  date: z
    .string()
    .min(1, 'Date is required')
    .max(20),
  time: z
    .string()
    .min(1, 'Time is required')
    .max(20),
  comments: z.string().max(2000).optional().default(''),
  paymentMethod: z.enum(['stripe', 'zelle', 'cash']).optional().default('cash'),
  cartItems: z.array(cartItemSchema).optional(),
  subtotal: z.number().min(0).max(1000000).optional(),
  tax: z.number().min(0).max(1000000).optional(),
  total: z.number().min(0).max(1000000).optional(),
})

export type BookingFormInput = z.infer<typeof bookingFormSchema>

// ==========================================
// Order Lookup
// ==========================================

export const orderLookupSchema = z.object({
  email: emailField,
})

export type OrderLookupInput = z.infer<typeof orderLookupSchema>

// ==========================================
// Order Status Update
// ==========================================

export const orderUpdateSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  orderStatus: z
    .enum(['pending', 'confirmed', 'completed', 'cancelled'])
    .optional(),
  paymentStatus: z
    .enum(['pending', 'paid', 'failed'])
    .optional(),
})

export type OrderUpdateInput = z.infer<typeof orderUpdateSchema>

// ==========================================
// Stripe Checkout
// ==========================================

const stripeItemSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['battery', 'service']).default('service'),
  quantity: z.number().int().min(1).max(100),
})

const legacyLineItemSchema = z.object({
  price_data: z.object({
    currency: z.string(),
    product_data: z.object({
      name: z.string(),
      description: z.string().optional(),
    }),
    unit_amount: z.number().int().min(1).max(10000000),
  }),
  quantity: z.number().int().min(1).max(100),
})

const stripeCheckoutBase = z.object({
  items: z.array(stripeItemSchema).optional(),
  customerEmail: emailField.optional(),
  bookingData: z.record(z.string(), z.unknown()).optional(),
  zipCode: z.string().max(10).optional(),
  couponCode: z.string().max(50).optional(),
  lineItems: z.array(legacyLineItemSchema).optional(),
})

export const stripeCheckoutSchema = stripeCheckoutBase.refine(
  (data) => (data.items && data.items.length > 0) || (data.lineItems && data.lineItems.length > 0),
  { message: 'Either items or lineItems must be provided' }
)

export type StripeCheckoutInput = z.infer<typeof stripeCheckoutSchema>

// ==========================================
// Login
// ==========================================

export const loginSchema = z.object({
  email: emailField,
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password too long'),
  totpCode: z
    .string()
    .regex(/^\d{6}$/, 'TOTP code must be 6 digits')
    .optional(),
})

export type LoginInput = z.infer<typeof loginSchema>

// ==========================================
// 2FA
// ==========================================

export const totpVerifySchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'TOTP code must be 6 digits'),
})

export type TotpVerifyInput = z.infer<typeof totpVerifySchema>

export const totpDisableSchema = z.object({
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password too long'),
})

export type TotpDisableInput = z.infer<typeof totpDisableSchema>

// ==========================================
// Save Batteries
// ==========================================

const batterySchema = z.object({
  id: z.string().min(1),
  vehicle: z.string().min(1).max(200),
  batteryType: z.string().min(1).max(200),
  condition: z.enum(['new', 'refurbished']),
  price: z.number().min(0).max(100000),
  warranty: z.string().min(1).max(100),
  image: z.string().max(500),
  description: z.string().max(2000),
})

export const saveBatteriesSchema = z.object({
  batteries: z.array(batterySchema).min(1).max(1000),
})

export type SaveBatteriesInput = z.infer<typeof saveBatteriesSchema>

// ==========================================
// Helper: Format Zod errors into readable message
// ==========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatZodError(error: z.ZodError<any>): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join('.')
      return path ? `${path}: ${issue.message}` : issue.message
    })
    .join(', ')
}

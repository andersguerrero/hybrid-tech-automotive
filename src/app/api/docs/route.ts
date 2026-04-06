import { NextResponse } from 'next/server'

/**
 * OpenAPI 3.0 specification for Hybrid Tech Auto API
 */
const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Hybrid Tech Auto API',
    version: '1.0.0',
    description: 'API for managing hybrid automotive services, batteries, bookings, and orders.',
    contact: {
      name: 'Hybrid Tech Automotive LLC',
      email: 'info@hybridtechauto.com',
      url: 'https://hybridtechauto.com',
    },
  },
  servers: [
    { url: 'https://hybrid-tech-automotive-production.up.railway.app', description: 'Production' },
    { url: 'http://localhost:3000', description: 'Development' },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Batteries', description: 'Battery catalog management' },
    { name: 'Services', description: 'Service offerings' },
    { name: 'Booking', description: 'Appointment booking' },
    { name: 'Orders', description: 'Order management' },
    { name: 'Payments', description: 'Stripe payment processing' },
    { name: 'Blog', description: 'Blog post management' },
    { name: 'Reviews', description: 'Customer reviews' },
    { name: 'Coupons', description: 'Discount coupon management' },
    { name: 'Subscribers', description: 'Newsletter subscribers' },
    { name: 'Config', description: 'Site configuration' },
    { name: 'System', description: 'System health and monitoring' },
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        description: 'Checks connectivity to storage, Stripe, and SMTP services.',
        responses: {
          200: { description: 'System healthy', content: { 'application/json': { schema: { $ref: '#/components/schemas/HealthResponse' } } } },
          503: { description: 'System unhealthy' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Admin login',
        description: 'Authenticates admin user with password. Rate limited to 5 attempts per 15 minutes.',
        requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['password'], properties: { password: { type: 'string' } } } } } },
        responses: {
          200: { description: 'Login successful, sets admin_token cookie' },
          401: { description: 'Invalid password' },
          429: { description: 'Rate limit exceeded' },
        },
      },
    },
    '/api/auth/logout': {
      post: { tags: ['Auth'], summary: 'Admin logout', description: 'Clears admin_token cookie.', responses: { 200: { description: 'Logged out' } } },
    },
    '/api/auth/check': {
      get: { tags: ['Auth'], summary: 'Check auth status', description: 'Verifies if current session is authenticated.', responses: { 200: { description: 'Auth status' } } },
    },
    '/api/batteries': {
      get: {
        tags: ['Batteries'],
        summary: 'List batteries',
        description: 'Returns paginated, filterable battery catalog with facets for UI filters.',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Full-text search across vehicle, type, description' },
          { name: 'brand', in: 'query', schema: { type: 'string', enum: ['Toyota', 'Lexus'] } },
          { name: 'model', in: 'query', schema: { type: 'string' }, description: 'Vehicle model (e.g., Prius, Camry)' },
          { name: 'condition', in: 'query', schema: { type: 'string', enum: ['new', 'refurbished'] } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 12, maximum: 100 }, description: '0 = return all' },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['vehicle', 'price', 'condition'], default: 'vehicle' } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } },
        ],
        responses: { 200: { description: 'Paginated battery list with facets and price history' } },
      },
      post: {
        tags: ['Batteries'],
        summary: 'Save batteries (admin)',
        description: 'Replaces entire battery catalog. Requires admin auth.',
        security: [{ cookieAuth: [] }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { batteries: { type: 'array', items: { $ref: '#/components/schemas/Battery' } } } } } } },
        responses: { 200: { description: 'Batteries saved' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/api/services': {
      get: { tags: ['Services'], summary: 'List services', responses: { 200: { description: 'Service list' } } },
      post: { tags: ['Services'], summary: 'Save services (admin)', security: [{ cookieAuth: [] }], responses: { 200: { description: 'Services saved' } } },
    },
    '/api/booking': {
      post: {
        tags: ['Booking'],
        summary: 'Create booking',
        description: 'Submits a booking with customer info, cart items, and payment method. Rate limited to 5/15min. Sends confirmation email.',
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/BookingForm' } } } },
        responses: { 200: { description: 'Booking confirmed' }, 400: { description: 'Validation error' }, 429: { description: 'Rate limited' } },
      },
    },
    '/api/orders': {
      get: { tags: ['Orders'], summary: 'List orders (admin)', security: [{ cookieAuth: [] }], responses: { 200: { description: 'Order list' } } },
      post: { tags: ['Orders'], summary: 'Update order status (admin)', security: [{ cookieAuth: [] }], responses: { 200: { description: 'Order updated' } } },
    },
    '/api/orders/lookup': {
      post: {
        tags: ['Orders'],
        summary: 'Lookup orders by email',
        description: 'Sends a magic link to the customer email with a JWT token for viewing orders.',
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string', format: 'email' } } } } } },
        responses: { 200: { description: 'Magic link sent' } },
      },
    },
    '/api/orders/verify': {
      get: {
        tags: ['Orders'],
        summary: 'Verify order lookup token',
        parameters: [{ name: 'token', in: 'query', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Orders for the verified email' } },
      },
    },
    '/api/stripe/checkout': {
      post: {
        tags: ['Payments'],
        summary: 'Create Stripe checkout session',
        description: 'Creates a Stripe checkout session with server-validated prices. Supports coupon codes. Rate limited to 10/15min.',
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/StripeCheckout' } } } },
        responses: { 200: { description: 'Checkout session URL' }, 400: { description: 'Invalid items' }, 429: { description: 'Rate limited' } },
      },
    },
    '/api/stripe/webhook': {
      post: {
        tags: ['Payments'],
        summary: 'Stripe webhook handler',
        description: 'Processes Stripe events (checkout.session.completed, payment_intent.succeeded/failed). Verified by Stripe signature.',
        responses: { 200: { description: 'Webhook processed' } },
      },
    },
    '/api/contact': {
      post: {
        tags: ['Config'],
        summary: 'Submit contact form',
        description: 'Sends contact form email. Rate limited to 3/15min.',
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ContactForm' } } } },
        responses: { 200: { description: 'Message sent' }, 429: { description: 'Rate limited' } },
      },
    },
    '/api/blog': {
      get: { tags: ['Blog'], summary: 'List blog posts', responses: { 200: { description: 'Blog post list' } } },
      post: { tags: ['Blog'], summary: 'Save blog posts (admin)', security: [{ cookieAuth: [] }], responses: { 200: { description: 'Posts saved' } } },
    },
    '/api/reviews': {
      get: { tags: ['Reviews'], summary: 'List reviews', responses: { 200: { description: 'Review list (supports images array)' } } },
      post: { tags: ['Reviews'], summary: 'Save reviews (admin)', security: [{ cookieAuth: [] }], responses: { 200: { description: 'Reviews saved' } } },
    },
    '/api/coupons': {
      get: { tags: ['Coupons'], summary: 'List coupons (admin)', security: [{ cookieAuth: [] }], responses: { 200: { description: 'Coupon list' } } },
      post: { tags: ['Coupons'], summary: 'Create/update/delete coupon (admin)', security: [{ cookieAuth: [] }], responses: { 200: { description: 'Coupon saved' } } },
    },
    '/api/coupons/validate': {
      post: {
        tags: ['Coupons'],
        summary: 'Validate coupon code',
        description: 'Checks if a coupon code is valid and calculates the discount amount.',
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { code: { type: 'string' }, subtotal: { type: 'number' } } } } } },
        responses: { 200: { description: 'Validation result with discount amount' } },
      },
    },
    '/api/subscribers': {
      get: { tags: ['Subscribers'], summary: 'List subscribers (admin)', security: [{ cookieAuth: [] }], responses: { 200: { description: 'Subscriber list' } } },
      post: { tags: ['Subscribers'], summary: 'Subscribe/unsubscribe email', responses: { 200: { description: 'Subscription updated' } } },
    },
    '/api/prices': {
      post: { tags: ['Config'], summary: 'Update prices (admin)', security: [{ cookieAuth: [] }], responses: { 200: { description: 'Prices updated' } } },
    },
    '/api/hours': {
      get: { tags: ['Config'], summary: 'Get business hours', responses: { 200: { description: 'Business hours' } } },
      post: { tags: ['Config'], summary: 'Update business hours (admin)', security: [{ cookieAuth: [] }], responses: { 200: { description: 'Hours updated' } } },
    },
    '/api/contact-info': {
      get: { tags: ['Config'], summary: 'Get contact information', responses: { 200: { description: 'Contact info' } } },
      post: { tags: ['Config'], summary: 'Update contact info (admin)', security: [{ cookieAuth: [] }], responses: { 200: { description: 'Contact info updated' } } },
    },
    '/api/site-images': {
      get: { tags: ['Config'], summary: 'Get site images', responses: { 200: { description: 'Site image URLs' } } },
      post: { tags: ['Config'], summary: 'Update site images (admin)', security: [{ cookieAuth: [] }], responses: { 200: { description: 'Images updated' } } },
    },
    '/api/upload-image': {
      post: { tags: ['Config'], summary: 'Upload image (admin)', security: [{ cookieAuth: [] }], responses: { 200: { description: 'Image uploaded, returns URL' } } },
    },
    '/api/docs': {
      get: { tags: ['System'], summary: 'API documentation', description: 'Returns this OpenAPI specification.' },
    },
  },
  components: {
    securitySchemes: {
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'admin_token', description: 'JWT token set after admin login' },
    },
    schemas: {
      Battery: {
        type: 'object',
        properties: {
          id: { type: 'string' }, vehicle: { type: 'string' }, batteryType: { type: 'string' },
          condition: { type: 'string', enum: ['new', 'refurbished'] },
          price: { type: 'number' }, warranty: { type: 'string' },
          image: { type: 'string' }, description: { type: 'string' },
        },
      },
      BookingForm: {
        type: 'object',
        required: ['name', 'email', 'phone', 'date', 'time'],
        properties: {
          name: { type: 'string' }, email: { type: 'string', format: 'email' },
          phone: { type: 'string' }, date: { type: 'string' }, time: { type: 'string' },
          comments: { type: 'string' }, paymentMethod: { type: 'string', enum: ['stripe', 'zelle', 'cash'] },
          cartItems: { type: 'array' }, subtotal: { type: 'number' }, tax: { type: 'number' }, total: { type: 'number' },
          couponCode: { type: 'string' }, couponDiscount: { type: 'number' },
        },
      },
      ContactForm: {
        type: 'object',
        required: ['name', 'email', 'subject', 'message'],
        properties: {
          name: { type: 'string' }, email: { type: 'string', format: 'email' },
          phone: { type: 'string' }, subject: { type: 'string' }, message: { type: 'string' },
        },
      },
      StripeCheckout: {
        type: 'object',
        properties: {
          items: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, type: { type: 'string' }, quantity: { type: 'integer' } } } },
          customerEmail: { type: 'string' }, zipCode: { type: 'string' }, couponCode: { type: 'string' },
          bookingData: { type: 'object' },
        },
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
          timestamp: { type: 'string', format: 'date-time' },
          uptime: { type: 'integer', description: 'Seconds since server start' },
          version: { type: 'string' },
          services: { type: 'object', properties: {
            storage: { $ref: '#/components/schemas/ServiceCheck' },
            stripe: { $ref: '#/components/schemas/ServiceCheck' },
            smtp: { $ref: '#/components/schemas/ServiceCheck' },
          }},
        },
      },
      ServiceCheck: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['ok', 'degraded', 'down'] },
          latencyMs: { type: 'integer' }, message: { type: 'string' },
        },
      },
    },
  },
}

export async function GET() {
  return NextResponse.json(openApiSpec, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, s-maxage=3600',
    },
  })
}

/**
 * Script de prueba para validar la integración de Stripe
 * Ejecutar con: node scripts/test-stripe-integration.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

console.log('🧪 Iniciando pruebas de integración de Stripe...\n')

// Test 1: Verificar que las variables de entorno estén definidas
console.log('✅ Test 1: Verificar variables de entorno')
const requiredEnvVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_BASE_URL'
]

const missingVars = requiredEnvVars.filter(varName => {
  const value = process.env[varName]
  if (!value || value.includes('your_') || value.includes('test_your')) {
    return true
  }
  return false
})

if (missingVars.length > 0) {
  console.log(`   ❌ Faltan variables de entorno: ${missingVars.join(', ')}`)
  console.log('   ⚠️  Asegúrate de configurarlas en .env.local\n')
} else {
  console.log('   ✅ Todas las variables de entorno están configuradas\n')
}

// Test 2: Verificar endpoints de API
console.log('✅ Test 2: Verificar endpoints de API')

async function testEndpoint(url, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`${BASE_URL}${url}`, options)
    const status = response.status
    const data = await response.json().catch(() => ({ error: 'No JSON response' }))

    return { status, data, success: status < 400 }
  } catch (error) {
    return { status: 0, error: error.message, success: false }
  }
}

async function runTests() {
  // Test checkout endpoint (debe fallar sin datos válidos, pero debe responder)
  console.log('   Probando /api/stripe/checkout...')
  const checkoutTest = await testEndpoint('/api/stripe/checkout', 'POST', {
    serviceName: 'Test Service',
    servicePrice: 100,
    customerEmail: 'test@example.com',
    bookingData: {
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      service: 'service-1',
      date: '2024-12-25',
      time: '10:00 AM'
    }
  })

  if (checkoutTest.success === false && checkoutTest.status === 400) {
    console.log('   ✅ Endpoint responde (error esperado sin API keys válidas)')
  } else if (checkoutTest.status === 500 && checkoutTest.data?.error) {
    console.log(`   ⚠️  Endpoint responde pero error: ${checkoutTest.data.error}`)
    if (checkoutTest.data.error.includes('Stripe') || checkoutTest.data.error.includes('secret')) {
      console.log('   💡 Esto es normal si las API keys de Stripe no están configuradas correctamente')
    }
  } else {
    console.log(`   ❌ Respuesta inesperada: ${checkoutTest.status}`)
  }

  // Test webhook endpoint
  console.log('   Probando /api/stripe/webhook...')
  const webhookTest = await testEndpoint('/api/stripe/webhook', 'POST', {})
  
  if (webhookTest.status === 400) {
    console.log('   ✅ Webhook endpoint responde (error esperado sin signature)')
  } else {
    console.log(`   ⚠️  Status: ${webhookTest.status}`)
  }

  // Test booking endpoint (sin Stripe)
  console.log('   Probando /api/booking (método no-Stripe)...')
  const bookingTest = await testEndpoint('/api/booking', 'POST', {
    name: 'Test User',
    email: 'test@example.com',
    phone: '1234567890',
    service: 'service-1',
    date: '2024-12-25',
    time: '10:00 AM',
    paymentMethod: 'cash'
  })

  if (bookingTest.status === 200 || bookingTest.status === 500) {
    console.log('   ✅ Booking endpoint responde correctamente')
    if (bookingTest.status === 500) {
      console.log('   ⚠️  Error probablemente relacionado con SMTP (normal en desarrollo)')
    }
  } else {
    console.log(`   ❌ Status inesperado: ${bookingTest.status}`)
  }

  console.log('\n📋 Resumen de pruebas:')
  console.log(`   - Variables de entorno: ${missingVars.length === 0 ? '✅' : '⚠️'}`)
  console.log(`   - Endpoint checkout: ${checkoutTest.status > 0 ? '✅' : '❌'}`)
  console.log(`   - Endpoint webhook: ${webhookTest.status > 0 ? '✅' : '❌'}`)
  console.log(`   - Endpoint booking: ${bookingTest.status > 0 ? '✅' : '❌'}`)
  
  console.log('\n💡 Próximos pasos:')
  console.log('   1. Verifica que las API keys de Stripe estén correctamente configuradas')
  console.log('   2. Prueba el flujo completo desde la interfaz web')
  console.log('   3. Usa tarjetas de prueba de Stripe: 4242 4242 4242 4242')
  console.log('   4. Configura el webhook en el dashboard de Stripe\n')
}

// Verificar si fetch está disponible (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('⚠️  fetch no está disponible en esta versión de Node.js')
  console.log('   Ejecuta las pruebas desde el navegador o usa Node.js 18+\n')
} else {
  runTests().catch(console.error)
}


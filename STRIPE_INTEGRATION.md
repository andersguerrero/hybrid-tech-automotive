# Integración con Stripe - Requisitos y Pasos

## Estado Actual
✅ Código base de Stripe ya existe
✅ Librerías instaladas (`stripe`, `@stripe/stripe-js`)
✅ Endpoints API básicos creados
✅ Página de éxito creada
⚠️ Falta integrar en el flujo de booking
⚠️ Falta configuración de variables de entorno
⚠️ Falta webhook handler para confirmar pagos

---

## 1. Configuración de Cuenta Stripe

### Pasos para obtener las API Keys:

1. **Crear cuenta en Stripe**
   - Ir a https://stripe.com
   - Registrarse/Iniciar sesión
   - Completar información del negocio

2. **Obtener API Keys (Modo Test)**
   - Dashboard → Developers → API Keys
   - Copiar "Publishable key" (empieza con `pk_test_`)
   - Copiar "Secret key" (empieza con `sk_test_`)

3. **Configurar Webhooks (opcional pero recomendado)**
   - Dashboard → Developers → Webhooks
   - Add endpoint: `https://tudominio.com/api/stripe/webhook`
   - Seleccionar eventos:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`

---

## 2. Variables de Entorno

Agregar a `.env.local`:

```env
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_tu_publishable_key_aqui
STRIPE_SECRET_KEY=sk_test_tu_secret_key_aqui
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui

# Base URL (necesaria para redirects)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Para producción:**
- Usar keys de producción (`pk_live_` y `sk_live_`)
- Actualizar `NEXT_PUBLIC_BASE_URL` con el dominio real

---

## 3. Cambios Necesarios en el Código

### A. Actualizar `src/app/booking/page.tsx`
- Integrar Stripe Checkout cuando se selecciona "Stripe" como método de pago
- Redirigir a Stripe Checkout antes de enviar el booking
- Guardar información del booking temporalmente (sessionStorage o estado)

### B. Crear Webhook Handler
- `src/app/api/stripe/webhook/route.ts`
- Verificar firma del webhook
- Procesar eventos de pago exitoso
- Confirmar booking y enviar emails

### C. Actualizar `src/app/api/booking/route.ts`
- Si el pago es Stripe, esperar confirmación del webhook
- Si es otro método (Zelle, Cash), procesar inmediatamente

### D. Mejorar Página de Éxito
- Mostrar detalles del booking
- Opción de descargar recibo
- Enlaces útiles

---

## 4. Flujo de Pago Propuesto

```
1. Usuario completa formulario de booking
2. Selecciona "Stripe" como método de pago
3. Click en "Book Appointment"
4. Sistema crea Checkout Session en Stripe
5. Redirige a Stripe Checkout
6. Usuario completa pago en Stripe
7. Stripe redirige a /booking/success
8. Webhook confirma pago y procesa booking
9. Email de confirmación enviado
```

---

## 5. Funcionalidades Adicionales Recomendadas

### A. Manejo de Precios
- Calcular precio total basado en servicio seleccionado
- Mostrar precio en el formulario de booking
- Validar precio antes de crear checkout session

### B. Gestión de Reservas
- Guardar bookings en base de datos (cuando se implemente)
- Estado de booking: "pending_payment", "confirmed", "completed"
- Sistema de notificaciones

### C. Seguridad
- Validar precio en el backend (no confiar en el frontend)
- Verificar firma de webhook
- Sanitizar datos de entrada
- Rate limiting en endpoints de pago

---

## 6. Testing

### Modo Test de Stripe
- Usar tarjetas de prueba:
  - Éxito: `4242 4242 4242 4242`
  - Rechazo: `4000 0000 0000 0002`
  - 3D Secure: `4000 0027 6000 3184`
- CVV: cualquier 3 dígitos
- Fecha: cualquier fecha futura

---

## 7. Checklist de Implementación

- [ ] Obtener API Keys de Stripe
- [ ] Configurar variables de entorno
- [ ] Integrar Stripe Checkout en booking page
- [ ] Crear webhook handler
- [ ] Actualizar flujo de booking para manejar Stripe
- [ ] Probar flujo completo en modo test
- [ ] Configurar webhooks en dashboard de Stripe
- [ ] Probar eventos de webhook
- [ ] Agregar manejo de errores
- [ ] Actualizar página de éxito con detalles
- [ ] Testing en producción con datos reales

---

## 8. Próximos Pasos

1. **Fase 1: Integración Básica**
   - Conectar booking con Stripe Checkout
   - Redirección básica

2. **Fase 2: Confirmación de Pago**
   - Implementar webhook handler
   - Confirmar bookings automáticamente

3. **Fase 3: Gestión Completa**
   - Base de datos para bookings
   - Panel de administración
   - Historial de pagos
   - Reembolsos (si es necesario)

---

## Notas Importantes

⚠️ **Nunca exponer `STRIPE_SECRET_KEY` en el frontend**
⚠️ **Siempre validar precios en el backend**
⚠️ **Usar HTTPS en producción**
⚠️ **Implementar rate limiting**
⚠️ **Logging de transacciones para auditoría**


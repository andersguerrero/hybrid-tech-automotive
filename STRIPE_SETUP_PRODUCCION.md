# Configuración de Stripe para Producción - hybridtechauto.com

## Estado del código ✅
- Checkout con Stripe implementado (carrito y booking)
- API `/api/stripe/checkout` funcionando
- Webhook `/api/stripe/webhook` para confirmar pagos y enviar emails
- Página de éxito `/booking/success`

## Pasos para activar Stripe en producción

### 1. Cuenta Stripe (si aún no la tienes)
1. Ir a [stripe.com](https://stripe.com) y crear cuenta
2. Completar información del negocio (requerido para recibir pagos reales)

### 2. Obtener las claves de producción
1. En Stripe Dashboard: **Developers → API Keys**
2. Activar el modo **Live** (interruptor arriba)
3. Copiar:
   - **Publishable key** (empieza con `pk_live_`)
   - **Secret key** (empieza con `sk_live_`)

### 3. Configurar el Webhook en Stripe
1. Stripe Dashboard → **Developers → Webhooks**
2. **Add endpoint**
3. **Endpoint URL:** `https://hybridtechauto.com/api/stripe/webhook`
4. **Eventos a escuchar:**
   - `checkout.session.completed`
   - `payment_intent.succeeded` (opcional)
   - `payment_intent.payment_failed` (opcional)
5. **Add endpoint**
6. En el nuevo webhook, hacer clic para ver detalles
7. En **Signing secret**, hacer clic en **Reveal** y copiar (empieza con `whsec_`)

### 4. Variables de entorno en Vercel
1. Ir a [vercel.com](https://vercel.com) → tu proyecto
2. **Settings → Environment Variables**
3. Agregar (para **Production**):

| Nombre | Valor | Notas |
|--------|-------|-------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | La clave secreta de producción |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | La clave pública (opcional si no la usas en el frontend) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | El signing secret del webhook |
| `NEXT_PUBLIC_BASE_URL` | `https://hybridtechauto.com` | Para redirects de success/cancel |

4. **Save** y hacer un **Redeploy** del proyecto para que tome las nuevas variables

### 5. Probar el flujo
1. Añadir un producto al carrito o ir a **Booking**
2. Seleccionar **Credit Card (Stripe)** como método de pago
3. Completar el formulario y proceder
4. Deberías ser redirigido a Stripe Checkout
5. Usar una tarjeta real (o en modo test: `4242 4242 4242 4242`)
6. Tras el pago → redirección a `/booking/success`
7. Revisar que llegue el email de confirmación

### Tarjetas de prueba (modo Test)
- Éxito: `4242 4242 4242 4242`
- Rechazo: `4000 0000 0000 0002`
- CVV: cualquier 3 dígitos
- Fecha: cualquier fecha futura

---

## Checklist final

- [ ] Cuenta Stripe creada y verificada
- [ ] Claves Live copiadas
- [ ] Webhook creado apuntando a `https://hybridtechauto.com/api/stripe/webhook`
- [ ] `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` y `NEXT_PUBLIC_BASE_URL` en Vercel
- [ ] Redeploy del proyecto
- [ ] Prueba de pago exitosa
- [ ] Email de confirmación recibido

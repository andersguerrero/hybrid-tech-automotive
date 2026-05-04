# Guía de Pruebas - Integración de Stripe

## ✅ Estado de la Implementación

La integración de Stripe está completa y lista para probar. Todos los componentes están implementados y sin errores de compilación.

---

## 🧪 Pruebas Manuales

### 1. Verificar Variables de Entorno

Verifica que en tu `.env.local` tengas:

```env
STRIPE_SECRET_KEY=sk_test_... (tu clave secreta)
STRIPE_PUBLISHABLE_KEY=pk_test_... (tu clave pública)
STRIPE_WEBHOOK_SECRET=whsec_... (tu secreto de webhook)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**✅ Verificación:** Si ya configuraste estas variables, puedes continuar.

---

### 2. Prueba del Flujo Completo de Booking

#### Paso 1: Acceder a la página de booking
- Ir a: `http://localhost:3000/booking`
- ✅ La página debe cargar sin errores
- ✅ Debe mostrar el formulario de booking

#### Paso 2: Completar el formulario
1. Llenar nombre, email, teléfono
2. **Seleccionar un servicio** (debe mostrar el precio automáticamente)
3. Seleccionar fecha y hora
4. Seleccionar **"Credit Card (Stripe)"** como método de pago
5. Agregar comentarios (opcional)

#### Paso 3: Enviar formulario
- Click en "Book Appointment"
- ✅ Debe redirigir a Stripe Checkout (página de Stripe)
- ✅ Si hay error, debe mostrarse en la página de booking

#### Paso 4: Procesar pago en Stripe
- Usar tarjeta de prueba: `4242 4242 4242 4242`
- CVV: cualquier 3 dígitos (ej: 123)
- Fecha: cualquier fecha futura (ej: 12/25)
- Código postal: cualquier código válido (ej: 12345)
- Click en "Pay"

#### Paso 5: Verificar redirección
- ✅ Debe redirigir a `/booking/success`
- ✅ Debe mostrar detalles del booking
- ✅ Debe mostrar mensaje de confirmación

#### Paso 6: Verificar email
- ✅ Debe recibirse un email de confirmación (si SMTP está configurado)

---

### 3. Prueba de Otros Métodos de Pago

#### Zelle
1. Seleccionar "Zelle" como método de pago
2. Enviar formulario
3. ✅ Debe procesar el booking directamente sin Stripe
4. ✅ Debe mostrar mensaje de éxito en la misma página

#### Cash
1. Seleccionar "Cash" como método de pago
2. Enviar formulario
3. ✅ Debe procesar el booking directamente
4. ✅ Debe mostrar mensaje de éxito

---

### 4. Prueba de Validaciones

#### Validación de precio
- Intentar enviar formulario sin seleccionar servicio
- ✅ Debe mostrar error: "Please select a service to proceed with payment"

#### Validación de campos requeridos
- Enviar formulario vacío o con campos faltantes
- ✅ Debe mostrar errores de validación

#### Validación de precio en backend
- El backend valida que el precio esté entre 0 y 100,000
- ✅ Esto previene manipulación de precios

---

### 5. Prueba de Webhook (Avanzado)

#### Configurar Webhook en Stripe Dashboard
1. Ir a: https://dashboard.stripe.com/test/webhooks
2. Click en "Add endpoint"
3. URL: `https://tudominio.com/api/stripe/webhook`
   - Para desarrollo local, usa: `http://localhost:3000/api/stripe/webhook` (con Stripe CLI)
4. Seleccionar eventos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy el "Signing secret" y agrégarlo a `.env.local` como `STRIPE_WEBHOOK_SECRET`

#### Probar Webhook
- Realizar un pago de prueba
- ✅ El webhook debe recibir el evento
- ✅ Debe enviar email de confirmación automáticamente
- ✅ Debe guardar el booking (cuando implementes base de datos)

---

## 🐛 Posibles Errores y Soluciones

### Error: "Failed to create payment session"
**Causa:** API keys de Stripe no configuradas o inválidas
**Solución:** Verifica que `STRIPE_SECRET_KEY` y `STRIPE_PUBLISHABLE_KEY` estén correctamente configuradas en `.env.local`

### Error: "Webhook signature verification failed"
**Causa:** `STRIPE_WEBHOOK_SECRET` no coincide con el del dashboard
**Solución:** Verifica que el secreto del webhook en `.env.local` sea el correcto

### Error: "Invalid price amount"
**Causa:** Precio fuera del rango válido (0-100,000)
**Solución:** Verifica los precios de servicios/baterías en los datos

### No se redirige a Stripe Checkout
**Causa:** `NEXT_PUBLIC_BASE_URL` no está configurada
**Solución:** Agrega `NEXT_PUBLIC_BASE_URL=http://localhost:3000` a `.env.local`

### No se muestran detalles en página de éxito
**Causa:** sessionStorage no tiene datos de booking
**Solución:** Esto es normal si accedes directamente a `/booking/success` sin pasar por el flujo de pago

---

## ✅ Checklist de Verificación

- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Servidor corriendo sin errores
- [ ] Página de booking carga correctamente
- [ ] Precio se muestra al seleccionar servicio
- [ ] Redirección a Stripe Checkout funciona
- [ ] Pago con tarjeta de prueba funciona
- [ ] Redirección a página de éxito funciona
- [ ] Detalles de booking se muestran en página de éxito
- [ ] Email de confirmación se envía (si SMTP configurado)
- [ ] Otros métodos de pago (Zelle, Cash) funcionan
- [ ] Webhook configurado y funcionando (opcional)

---

## 📝 Tarjetas de Prueba de Stripe

| Tarjeta | Resultado |
|---------|-----------|
| `4242 4242 4242 4242` | ✅ Pago exitoso |
| `4000 0000 0000 0002` | ❌ Pago rechazado |
| `4000 0027 6000 3184` | 🔐 Requiere 3D Secure |

**CVV:** Cualquier 3 dígitos  
**Fecha:** Cualquier fecha futura  
**Código Postal:** Cualquier código válido

---

## 🚀 Próximos Pasos

1. **Probar flujo completo manualmente** siguiendo esta guía
2. **Configurar webhook** en dashboard de Stripe para producción
3. **Implementar base de datos** para guardar bookings (opcional)
4. **Agregar notificaciones** al negocio cuando hay nuevos bookings
5. **Monitorear transacciones** en Stripe Dashboard

---

## 📞 Soporte

Si encuentras errores:
1. Revisa la consola del navegador (F12)
2. Revisa los logs del servidor
3. Verifica que todas las variables de entorno estén configuradas
4. Verifica que las API keys de Stripe sean válidas


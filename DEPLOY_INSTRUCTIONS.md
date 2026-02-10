# 🚀 Guía de Despliegue - Hybrid Tech Automotive

Tu proyecto está configurado para desplegarse en múltiples plataformas. Aquí están las opciones:

## ⚡ Despliegue Rápido (Recomendado)

### Opción 1: Vercel (Más Fácil - 2 minutos)

1. **Crea cuenta en Vercel** (si no tienes): https://vercel.com/signup

2. **Despliega directamente desde tu terminal:**
   ```bash
   ./deploy.sh
   ```
   
   O manualmente:
   ```bash
   vercel login
   vercel --prod
   ```

3. **O desde la Web:**
   - Sube tu código a GitHub
   - Ve a https://vercel.com/new
   - Importa tu repositorio
   - Configura variables de entorno (ver abajo)
   - ¡Deploy!

### Opción 2: Netlify (Similar - 2 minutos)

1. Ve a https://app.netlify.com/signup
2. Arrastra la carpeta `.next` después de hacer `npm run build`
3. O conecta tu repositorio de GitHub

### Opción 3: Railway (3 minutos)

1. Ve a https://railway.app
2. New Project → Deploy from GitHub
3. Selecciona tu repositorio
4. Railway detectará automáticamente Next.js

### Opción 4: Render (Gratis con sleep)

1. Ve a https://render.com
2. New → Web Service
3. Conecta tu repositorio de GitHub
4. Configura:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

## 📋 Variables de Entorno Necesarias

Configura estas variables en la plataforma que elijas:

```
SMTP_HOST=smtpout.secureserver.net
SMTP_PORT=465
SMTP_USER=info@hybridtechauto.com
SMTP_PASS=Toyotaprius
SMTP_SECURE=true

STRIPE_PUBLISHABLE_KEY=pk_live_tu_clave_publica
STRIPE_SECRET_KEY=sk_live_tu_clave_secreta
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret

BUSINESS_EMAIL=info@hybridtechauto.com
BUSINESS_PHONE=(832) 762-5299
BUSINESS_ADDRESS=24422 Starview Landing Ct, Spring, TX 77373
NEXT_PUBLIC_BUSINESS_PHONE=(832) 762-5299

NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=tu-secret-random
NEXT_PUBLIC_BASE_URL=https://tu-dominio.vercel.app

NEXT_PUBLIC_ADMIN_PASSWORD=Toyotaprius2024!
```

### 📸 Imágenes en producción (Vercel Blob)

Para que el panel de administración pueda subir imágenes en producción:

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Pestaña **Storage** → **Connect Database** → **Create New** → **Blob**
3. Crea un Blob Store y asígnelo a tu proyecto
4. La variable `BLOB_READ_WRITE_TOKEN` se configurará automáticamente
5. Las imágenes subidas desde el admin se guardarán en Vercel Blob y serán accesibles públicamente

## 🔄 Despliegue Automático con GitHub

Si usas GitHub, el workflow `.github/workflows/deploy.yml` está configurado para desplegar automáticamente cuando hagas push.

**Para activarlo:**
1. Sube tu código a GitHub
2. Obtén tus credenciales de Vercel:
   - Ve a https://vercel.com/account/tokens
   - Crea un nuevo token
   - Ve a tu proyecto en Vercel y copia `Project ID` y `Org ID`
3. Agrega secrets a GitHub:
   - Ve a tu repositorio → Settings → Secrets and variables → Actions
   - Agrega:
     - `VERCEL_TOKEN`
     - `VERCEL_ORG_ID`
     - `VERCEL_PROJECT_ID`

## 🐳 Despliegue con Docker

Si prefieres Docker:

```bash
docker build -t hybrid-tech-automotive .
docker run -p 3000:3000 hybrid-tech-automotive
```

## ✅ Verificación Post-Despliegue

Después de desplegar, verifica:
- ✅ El sitio carga correctamente
- ✅ Las API routes funcionan (`/api/contact`, `/api/booking`)
- ✅ Las variables de entorno están configuradas
- ✅ HTTPS está activo
- ✅ El dominio personalizado (opcional) está configurado

## 🆘 Problemas Comunes

### Error: "Couldn't find app directory"
✅ **Solucionado** - Los errores de TypeScript fueron corregidos

### Error de variables de entorno
- Verifica que todas las variables estén configuradas
- Usa valores de producción (no de prueba)

### El sitio no se actualiza
- Limpia la caché del CDN
- Espera 1-2 minutos para que se propague

---

**¿Necesitas ayuda?** Revisa los logs de despliegue en la plataforma que elegiste.

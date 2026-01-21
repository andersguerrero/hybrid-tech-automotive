# 🔄 Sincronización de Baterías: Localhost → Producción

## ✅ Solución Implementada

He creado una página de administración que permite sincronizar las baterías entre localhost y producción de forma automática.

## 🚀 Cómo Sincronizar (2 pasos simples)

### Paso 1: Desde Localhost (Exportar)

1. Abre tu navegador en: **http://localhost:3000/admin/export-batteries**
2. Verás todas tus baterías actuales con sus imágenes
3. Haz clic en **"Exportar JSON"** - se descargará un archivo JSON
4. Guarda ese archivo (por ejemplo: `batteries-export.json`)

### Paso 2: En Producción (Importar)

1. Abre tu navegador en: **https://hybrid-tech-automotive.vercel.app/admin/export-batteries**
2. Haz clic en **"Importar JSON"**
3. Selecciona el archivo que descargaste en el Paso 1
4. ¡Listo! Las baterías se guardarán automáticamente en producción

## 🔄 Alternativa: Sincronización Directa

Si ya estás en la página de exportación en localhost:

1. Haz clic en **"Sincronizar al Servidor"**
2. Esto guardará las baterías directamente en el servidor (aunque en Vercel es temporal)

## 📝 Notas Importantes

- **Las imágenes ya están en producción** (están en Git)
- Solo necesitas sincronizar los **datos de las baterías** (qué imagen usa cada batería)
- El proceso es **completamente automático** una vez que importas el JSON

## 🎯 Resultado

Después de importar, todas tus baterías con sus imágenes personalizadas aparecerán en producción exactamente como las tienes en localhost.

---

**¿Problemas?** Asegúrate de:
- Estar autenticado en el panel de admin
- Tener baterías guardadas en localStorage en localhost
- Tener conexión a internet para acceder a producción

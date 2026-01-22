# Solución para Sincronizar Baterías con Imágenes Nuevas

## El Problema

Cuando subes imágenes nuevas en localhost, estas se guardan en `localStorage` del navegador, pero **NO** se guardan en el código fuente (`src/data/batteries.ts`). 

Cuando despliegas, Vercel usa el código fuente original que tiene las imágenes antiguas.

## La Solución

Ahora el sistema guarda las baterías en **dos lugares**:

1. **`data/batteries-custom.json`** - Archivo JSON con las baterías actuales (se guarda siempre)
2. **`src/data/batteries.ts`** - Archivo fuente TypeScript (solo se puede actualizar en localhost)

## Cómo Funciona

### Opción 1: Automático (en localhost)

Cuando guardas baterías en el panel de admin en **localhost**, el sistema automáticamente:
1. Guarda en `localStorage`
2. Guarda en el servidor (`/api/batteries`)
3. Guarda en `data/batteries-custom.json`
4. **Actualiza `src/data/batteries.ts`** (solo en localhost)

Luego solo necesitas hacer commit y deploy:
```bash
git add src/data/batteries.ts data/batteries-custom.json
git commit -m "Update batteries with latest images"
vercel --prod --yes
```

### Opción 2: Manual (desde producción)

Si subiste imágenes en producción y quieres sincronizar:

1. **En localhost**, ejecuta el script de sincronización:
```bash
npm run sync-batteries
```

Este script:
- Lee las baterías desde `data/batteries-custom.json` (que se actualiza automáticamente en producción)
- Actualiza `src/data/batteries.ts` con las baterías actuales

2. **Haz commit y deploy**:
```bash
git add src/data/batteries.ts
git commit -m "Sync batteries from production"
vercel --prod --yes
```

## Flujo Completo Recomendado

1. **Sube imágenes en localhost** (panel admin)
2. **Guarda las baterías** (el sistema actualiza automáticamente `batteries.ts`)
3. **Revisa los cambios**: `git diff src/data/batteries.ts`
4. **Haz commit**: `git add src/data/batteries.ts && git commit -m "Update batteries"`
5. **Despliega**: `vercel --prod --yes`

## Nota Importante

- En **producción (Vercel)**, no se puede escribir archivos fuente (solo lectura)
- Por eso el sistema guarda en `batteries-custom.json` que luego puedes sincronizar localmente
- Siempre trabaja en **localhost** para subir imágenes nuevas, así se actualiza automáticamente el archivo fuente

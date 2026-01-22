# Sincronización Automática de Imágenes

## El Problema

Cuando subes imágenes nuevas en el panel de administración, estas se guardan en `public/images/` pero **NO** se agregan automáticamente a Git. Cuando despliegas, solo se incluyen las imágenes que están en el repositorio Git.

## La Solución

Ahora el sistema tiene **sincronización automática** de imágenes:

### Opción 1: Automático (Recomendado)

Cuando subes una imagen en el panel admin:
1. ✅ La imagen se guarda en `public/images/`
2. ✅ **Automáticamente se agrega a Git** (solo en localhost)
3. ✅ Solo necesitas hacer commit y deploy

**Flujo:**
```bash
# 1. Sube imágenes en el panel admin (http://localhost:3000/admin/batteries)
# 2. Las imágenes se agregan automáticamente a Git
# 3. Haz commit y deploy:
git commit -m "Add new images"
vercel --prod --yes
```

### Opción 2: Manual

Si prefieres controlar cuándo sincronizar:

```bash
# Sincronizar solo imágenes
npm run sync-images

# Sincronizar todo (imágenes + baterías + commit + deploy)
npm run sync-all
```

### Opción 3: Todo Automático

Para sincronizar imágenes, baterías, hacer commit y desplegar todo de una vez:

```bash
npm run sync-all
```

O con un mensaje personalizado:
```bash
npm run sync-all "Add new product images"
```

## Comandos Disponibles

- `npm run sync-images` - Sincroniza solo las imágenes nuevas con Git
- `npm run sync-batteries` - Sincroniza las baterías al archivo fuente
- `npm run sync-all` - Sincroniza todo, hace commit y despliega automáticamente

## Notas Importantes

- ⚠️ En **producción (Vercel)**, no se puede escribir archivos ni ejecutar Git
- ✅ Por eso la sincronización automática solo funciona en **localhost**
- ✅ Siempre trabaja en **localhost** para subir imágenes nuevas
- ✅ Las imágenes se agregan automáticamente a Git cuando las subes

## Flujo Completo Recomendado

1. **Sube imágenes en localhost** (panel admin)
   - Las imágenes se guardan y se agregan automáticamente a Git
   
2. **Revisa los cambios:**
   ```bash
   git status
   ```

3. **Haz commit:**
   ```bash
   git commit -m "Add new images"
   ```

4. **Despliega:**
   ```bash
   vercel --prod --yes
   ```

O usa el comando todo-en-uno:
```bash
npm run sync-all
```

## Solución de Problemas

### Las imágenes no se agregan automáticamente a Git

Esto puede pasar si:
- Estás en producción (Vercel) - esto es normal
- Hay un error con Git - ejecuta manualmente: `npm run sync-images`

### Las imágenes no aparecen en producción

Asegúrate de:
1. ✅ Hacer commit de las imágenes: `git add public/images/ && git commit -m "Add images"`
2. ✅ Desplegar: `vercel --prod --yes`
3. ✅ Verificar que las imágenes estén en el repositorio: `git ls-files public/images/`

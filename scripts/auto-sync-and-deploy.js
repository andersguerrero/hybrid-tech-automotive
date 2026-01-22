const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Script para sincronizar imágenes y baterías, hacer commit y desplegar automáticamente

console.log('🚀 Iniciando sincronización y despliegue automático...\n')

try {
  // 1. Sincronizar imágenes
  console.log('📸 Paso 1: Sincronizando imágenes...')
  try {
    execSync('npm run sync-images', { 
      encoding: 'utf8', 
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    })
  } catch (error) {
    console.log('⚠️  No hay imágenes nuevas o error al sincronizar')
  }
  
  // 2. Sincronizar baterías (si es necesario)
  console.log('\n🔋 Paso 2: Verificando baterías...')
  try {
    execSync('npm run sync-batteries', { 
      encoding: 'utf8', 
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    })
  } catch (error) {
    console.log('⚠️  No hay baterías nuevas o error al sincronizar')
  }
  
  // 3. Verificar si hay cambios
  console.log('\n📊 Paso 3: Verificando cambios...')
  const status = execSync('git status --porcelain', { 
    encoding: 'utf8', 
    cwd: path.join(__dirname, '..')
  })
  
  if (!status.trim()) {
    console.log('✅ No hay cambios para commitear')
    console.log('💡 Todo está sincronizado. No es necesario desplegar.')
    process.exit(0)
  }
  
  // 4. Mostrar cambios
  console.log('\n📝 Cambios detectados:')
  console.log(status)
  
  // 5. Agregar todos los cambios
  console.log('\n➕ Agregando cambios a Git...')
  execSync('git add -A', { 
    encoding: 'utf8', 
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  })
  
  // 6. Hacer commit
  console.log('\n💾 Haciendo commit...')
  const commitMessage = process.argv[2] || 'Update: Sync images and batteries'
  execSync(`git commit -m "${commitMessage}"`, { 
    encoding: 'utf8', 
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  })
  
  // 7. Desplegar
  console.log('\n🚀 Desplegando a producción...')
  execSync('vercel --prod --yes', { 
    encoding: 'utf8', 
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  })
  
  console.log('\n✅ ¡Sincronización y despliegue completados!')
  
} catch (error) {
  console.error('\n❌ Error durante la sincronización:', error.message)
  process.exit(1)
}

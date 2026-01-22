const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Script para sincronizar imágenes nuevas con Git
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images')

function syncImagesToGit() {
  try {
    console.log('🖼️  Sincronizando imágenes con Git...\n')
    
    // Verificar si hay imágenes sin agregar
    const status = execSync('git status --porcelain public/images/', { encoding: 'utf8', cwd: path.join(__dirname, '..') })
    
    if (!status.trim()) {
      console.log('✅ Todas las imágenes ya están sincronizadas con Git')
      return
    }
    
    // Mostrar imágenes nuevas
    const newImages = status.split('\n')
      .filter(line => line.trim())
      .map(line => line.trim().split(/\s+/)[1])
      .filter(file => file && file.includes('public/images/'))
    
    if (newImages.length === 0) {
      console.log('✅ No hay imágenes nuevas para sincronizar')
      return
    }
    
    console.log(`📸 Se encontraron ${newImages.length} imagen(es) nueva(s):`)
    newImages.forEach(img => {
      console.log(`   - ${img}`)
    })
    
    // Agregar todas las imágenes al staging
    execSync('git add public/images/', { encoding: 'utf8', cwd: path.join(__dirname, '..'), stdio: 'inherit' })
    
    console.log('\n✅ Imágenes agregadas a Git')
    console.log('\n📝 Próximos pasos:')
    console.log('   1. Revisa los cambios: git status')
    console.log('   2. Haz commit: git commit -m "Add new images"')
    console.log('   3. Despliega: vercel --prod --yes')
    
  } catch (error) {
    console.error('❌ Error sincronizando imágenes:', error.message)
    process.exit(1)
  }
}

syncImagesToGit()

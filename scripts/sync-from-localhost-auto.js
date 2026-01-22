const http = require('http')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Script que automáticamente sincroniza desde localStorage usando la página HTML

const BATTERIES_TS_PATH = path.join(__dirname, '..', 'src', 'data', 'batteries.ts')
const BATTERIES_JSON_PATH = path.join(__dirname, '..', 'data', 'batteries-custom.json')

function escapeString(str) {
  return str.replace(/'/g, "\\'").replace(/\n/g, '\\n')
}

function formatBattery(battery, index, total) {
  const vehicle = escapeString(battery.vehicle)
  const batteryType = escapeString(battery.batteryType)
  const condition = battery.condition
  const price = battery.price
  const warranty = escapeString(battery.warranty)
  const image = battery.image.replace(/"/g, '\\"')
  const description = escapeString(battery.description)
  
  return `  { id: '${battery.id}', vehicle: '${vehicle}', batteryType: '${batteryType}', condition: '${condition}', price: ${price}, warranty: '${warranty}', image: '${image}', description: '${description}' }${index < total - 1 ? ',' : ''}`
}

function triggerSyncFromBrowser() {
  return new Promise((resolve, reject) => {
    console.log('🌐 Abriendo página de sincronización en el navegador...')
    console.log('📋 Por favor, haz clic en "Sincronizar desde LocalStorage" en la ventana del navegador')
    console.log('⏳ Esperando 30 segundos para que completes la sincronización...\n')
    
    // Abrir navegador
    try {
      execSync('open http://localhost:3000/sync-from-localhost.html', { stdio: 'ignore' })
    } catch (error) {
      console.log('⚠️  No se pudo abrir el navegador automáticamente')
      console.log('💡 Por favor abre manualmente: http://localhost:3000/sync-from-localhost.html')
    }
    
    // Esperar 30 segundos
    setTimeout(() => {
      resolve()
    }, 30000)
  })
}

async function syncBatteries() {
  try {
    console.log('🔄 Sincronizando baterías desde localhost...\n')
    
    // Primero intentar leer desde el JSON (que se actualiza cuando se guarda desde el navegador)
    let batteries = []
    
    if (fs.existsSync(BATTERIES_JSON_PATH)) {
      const jsonData = fs.readFileSync(BATTERIES_JSON_PATH, 'utf8')
      batteries = JSON.parse(jsonData)
      console.log(`✅ Leídas ${batteries.length} baterías desde batteries-custom.json`)
    }
    
    // Si no hay suficientes baterías o no hay imágenes personalizadas, pedir sincronización manual
    const customImages = batteries.filter(b => 
      b.image && b.image.includes('battery-')
    )
    
    if (customImages.length === 0) {
      console.log('⚠️  No se encontraron baterías con imágenes personalizadas en el JSON')
      console.log('💡 Necesito sincronizar desde localStorage\n')
      
      await triggerSyncFromBrowser()
      
      // Intentar leer nuevamente después de la sincronización
      if (fs.existsSync(BATTERIES_JSON_PATH)) {
        const jsonData = fs.readFileSync(BATTERIES_JSON_PATH, 'utf8')
        batteries = JSON.parse(jsonData)
        console.log(`\n✅ Leídas ${batteries.length} baterías después de la sincronización`)
      }
    }
    
    if (batteries.length === 0) {
      console.log('❌ No se encontraron baterías para sincronizar')
      console.log('\n💡 Por favor:')
      console.log('   1. Abre http://localhost:3000/admin/batteries')
      console.log('   2. Asegúrate de que las baterías estén guardadas')
      console.log('   3. Abre http://localhost:3000/sync-from-localhost.html')
      console.log('   4. Haz clic en "Sincronizar desde LocalStorage"')
      return
    }
    
    // Guardar en JSON
    fs.writeFileSync(BATTERIES_JSON_PATH, JSON.stringify(batteries, null, 2), 'utf8')
    console.log(`💾 Guardadas ${batteries.length} baterías en batteries-custom.json`)
    
    // Contar imágenes personalizadas
    const customImagesCount = batteries.filter(b => 
      b.image && b.image.includes('battery-')
    ).length
    
    if (customImagesCount > 0) {
      console.log(`🖼️  ${customImagesCount} baterías con imágenes personalizadas detectadas`)
    }
    
    // Generar el contenido del archivo TypeScript
    const fileContent = `import { Battery } from '@/types'

export const batteries: Battery[] = [
${batteries.map((battery, index) => formatBattery(battery, index, batteries.length)).join('\n')}
]
`
    
    // Crear backup
    if (fs.existsSync(BATTERIES_TS_PATH)) {
      const backupPath = BATTERIES_TS_PATH + '.backup'
      fs.copyFileSync(BATTERIES_TS_PATH, backupPath)
      console.log(`📦 Backup creado: ${backupPath}`)
    }
    
    // Escribir el nuevo archivo
    fs.writeFileSync(BATTERIES_TS_PATH, fileContent, 'utf8')
    console.log(`✅ Archivo batteries.ts actualizado con ${batteries.length} baterías`)
    
    console.log(`\n📝 Próximos pasos:`)
    console.log(`   1. Revisa los cambios: git diff src/data/batteries.ts`)
    console.log(`   2. Haz commit: git add src/data/batteries.ts data/batteries-custom.json`)
    console.log(`   3. Commit: git commit -m "Sync batteries from localhost with custom images"`)
    console.log(`   4. Despliega: vercel --prod --yes`)
    
  } catch (error) {
    console.error('❌ Error sincronizando baterías:', error)
    process.exit(1)
  }
}

syncBatteries()

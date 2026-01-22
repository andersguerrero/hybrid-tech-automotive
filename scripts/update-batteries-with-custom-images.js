const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Script para actualizar batteries.ts con imágenes personalizadas encontradas

const BATTERIES_TS_PATH = path.join(__dirname, '..', 'src', 'data', 'batteries.ts')
const BATTERIES_JSON_PATH = path.join(__dirname, '..', 'data', 'batteries-custom.json')
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'batteries')

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

async function updateBatteriesWithCustomImages() {
  try {
    console.log('🔄 Actualizando baterías con imágenes personalizadas...\n')
    
    // Leer baterías actuales
    let batteries = []
    if (fs.existsSync(BATTERIES_JSON_PATH)) {
      batteries = JSON.parse(fs.readFileSync(BATTERIES_JSON_PATH, 'utf8'))
      console.log(`✅ Leídas ${batteries.length} baterías desde batteries-custom.json`)
    } else {
      // Leer desde batteries.ts
      const content = fs.readFileSync(BATTERIES_TS_PATH, 'utf8')
      const batteryRegex = /\{\s*id:\s*'([^']+)',\s*vehicle:\s*'([^']+)',\s*batteryType:\s*'([^']+)',\s*condition:\s*'([^']+)',\s*price:\s*(\d+),\s*warranty:\s*'([^']+)',\s*image:\s*'([^']+)',\s*description:\s*'([^']+)'\s*\}/g
      
      let match
      while ((match = batteryRegex.exec(content)) !== null) {
        batteries.push({
          id: match[1],
          vehicle: match[2].replace(/\\'/g, "'"),
          batteryType: match[3].replace(/\\'/g, "'"),
          condition: match[4],
          price: parseInt(match[5]),
          warranty: match[6].replace(/\\'/g, "'"),
          image: match[7].replace(/\\"/g, '"'),
          description: match[8].replace(/\\'/g, "'").replace(/\\n/g, '\n')
        })
      }
      console.log(`✅ Leídas ${batteries.length} baterías desde batteries.ts`)
    }
    
    if (batteries.length === 0) {
      console.log('❌ No se encontraron baterías')
      return
    }
    
    // Buscar imágenes personalizadas disponibles
    const customImages = fs.readdirSync(IMAGES_DIR)
      .filter(file => file.startsWith('battery-') && (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.webp')))
      .map(file => `/images/batteries/${file}`)
    
    console.log(`\n📸 Imágenes personalizadas encontradas: ${customImages.length}`)
    if (customImages.length > 0) {
      customImages.slice(0, 5).forEach(img => console.log(`   - ${img}`))
    }
    
    // Si hay imágenes personalizadas pero no se están usando, informar
    const batteriesWithCustomImages = batteries.filter(b => 
      b.image && b.image.includes('battery-')
    )
    
    if (batteriesWithCustomImages.length === 0 && customImages.length > 0) {
      console.log('\n⚠️  Se encontraron imágenes personalizadas pero no están asignadas a ninguna batería')
      console.log('💡 Las imágenes personalizadas necesitan ser asignadas manualmente en el panel admin')
    } else if (batteriesWithCustomImages.length > 0) {
      console.log(`\n✅ ${batteriesWithCustomImages.length} baterías ya usan imágenes personalizadas`)
    }
    
    // Guardar en JSON
    fs.writeFileSync(BATTERIES_JSON_PATH, JSON.stringify(batteries, null, 2), 'utf8')
    console.log(`💾 Guardadas ${batteries.length} baterías en batteries-custom.json`)
    
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
    console.log(`   3. Commit: git commit -m "Update batteries with custom images"`)
    console.log(`   4. Despliega: vercel --prod --yes`)
    
  } catch (error) {
    console.error('❌ Error actualizando baterías:', error)
    process.exit(1)
  }
}

updateBatteriesWithCustomImages()

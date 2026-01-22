const http = require('http')
const fs = require('fs')
const path = require('path')

// Este script fuerza la sincronización llamando directamente a la API de guardar

const BATTERIES_TS_PATH = path.join(__dirname, '..', 'src', 'data', 'batteries.ts')
const BATTERIES_JSON_PATH = path.join(__dirname, '..', 'data', 'batteries-custom.json')

// Primero, intentar leer desde el archivo inicial batteries.ts para obtener las baterías base
function readBatteriesFromSource() {
  try {
    const content = fs.readFileSync(BATTERIES_TS_PATH, 'utf8')
    // Extraer las baterías usando regex (aproximado, pero funcional)
    const batteries = []
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
    
    return batteries
  } catch (error) {
    console.error('Error leyendo baterías desde fuente:', error)
    return []
  }
}

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

function saveBatteriesToSource(batteries) {
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
}

async function syncBatteries() {
  console.log('🔄 Sincronizando baterías...\n')
  
  // Intentar leer desde JSON primero (si hay baterías guardadas del servidor)
  let batteries = []
  
  if (fs.existsSync(BATTERIES_JSON_PATH)) {
    try {
      const jsonData = fs.readFileSync(BATTERIES_JSON_PATH, 'utf8')
      const parsed = JSON.parse(jsonData)
      if (Array.isArray(parsed) && parsed.length > 0) {
        batteries = parsed
        console.log(`✅ Leídas ${batteries.length} baterías desde batteries-custom.json`)
      }
    } catch (error) {
      console.log('⚠️  Error leyendo JSON, continuando con fuente...')
    }
  }
  
  // Si no hay en JSON, leer desde el archivo fuente
  if (batteries.length === 0) {
    console.log('📂 Leyendo baterías desde archivo fuente...')
    batteries = readBatteriesFromSource()
    if (batteries.length > 0) {
      console.log(`✅ Leídas ${batteries.length} baterías desde batteries.ts`)
    }
  }
  
  if (batteries.length === 0) {
    console.log('❌ No se encontraron baterías para sincronizar')
    console.log('\n💡 Por favor:')
    console.log('   1. Abre http://localhost:3000/admin/batteries en tu navegador')
    console.log('   2. Guarda las baterías (esto las guardará en el servidor)')
    console.log('   3. Luego ejecuta este script nuevamente')
    return
  }
  
  // Guardar en ambos lugares
  saveBatteriesToSource(batteries)
  
  // Mostrar baterías con imágenes personalizadas
  const batteriesWithNewImages = batteries.filter(b => 
    b.image && b.image.includes('/images/batteries/') && 
    !b.image.match(/prius-(2004-2009|2010-2015|c-2012-2017)\.jpg/) &&
    !b.image.includes('generic-prius-gen4.jpg')
  )
  
  if (batteriesWithNewImages.length > 0) {
    console.log(`\n🖼️  Se encontraron ${batteriesWithNewImages.length} baterías con imágenes personalizadas:`)
    batteriesWithNewImages.slice(0, 5).forEach(b => {
      console.log(`   - ${b.vehicle}: ${b.image}`)
    })
  } else {
    console.log('\n⚠️  No se encontraron baterías con imágenes personalizadas nuevas')
    console.log('   Las baterías actuales usan las imágenes por defecto')
  }
  
  console.log(`\n📝 Próximos pasos:`)
  console.log(`   1. Revisa los cambios: git diff src/data/batteries.ts`)
  console.log(`   2. Haz commit: git add src/data/batteries.ts data/batteries-custom.json`)
  console.log(`   3. Commit: git commit -m "Update batteries with latest images"`)
  console.log(`   4. Despliega: vercel --prod --yes`)
}

syncBatteries()

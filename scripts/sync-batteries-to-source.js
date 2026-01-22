const fs = require('fs')
const path = require('path')

// Este script lee las baterías desde localStorage (simulado) o desde el archivo JSON
// y actualiza el archivo batteries.ts

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

async function syncBatteriesToSource() {
  try {
    // Intentar leer desde el archivo JSON primero (donde se guardan las baterías del servidor)
    let batteries = []
    
    if (fs.existsSync(BATTERIES_JSON_PATH)) {
      const jsonData = fs.readFileSync(BATTERIES_JSON_PATH, 'utf8')
      batteries = JSON.parse(jsonData)
      console.log(`✅ Leídas ${batteries.length} baterías desde batteries-custom.json`)
    } else {
      console.log('⚠️  No se encontró batteries-custom.json, usando baterías iniciales')
      // Leer desde batteries.ts actual
      const currentContent = fs.readFileSync(BATTERIES_TS_PATH, 'utf8')
      const match = currentContent.match(/export const batteries: Battery\[\] = \[([\s\S]*?)\]/)
      if (match) {
        // Parsear las baterías existentes (esto es complejo, mejor usar el JSON)
        console.log('⚠️  Usando baterías del archivo TypeScript actual')
      }
    }
    
    if (batteries.length === 0) {
      console.log('❌ No hay baterías para sincronizar')
      return
    }
    
    // Generar el contenido del archivo TypeScript
    const fileContent = `import { Battery } from '@/types'

export const batteries: Battery[] = [
${batteries.map((battery, index) => formatBattery(battery, index, batteries.length)).join('\n')}
]
`
    
    // Crear backup del archivo actual
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
    console.log(`   2. Haz commit: git add src/data/batteries.ts && git commit -m "Update batteries with latest images"`)
    console.log(`   3. Despliega: vercel --prod --yes`)
    
  } catch (error) {
    console.error('❌ Error sincronizando baterías:', error)
    process.exit(1)
  }
}

syncBatteriesToSource()

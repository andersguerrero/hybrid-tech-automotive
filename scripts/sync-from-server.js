const http = require('http')
const fs = require('fs')
const path = require('path')

// Este script obtiene las baterías desde el servidor local y actualiza el archivo fuente

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

function fetchBatteriesFromServer() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/batteries',
      method: 'GET'
    }

    const req = http.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          const result = JSON.parse(data)
          if (result.success && result.batteries) {
            resolve(result.batteries)
          } else {
            reject(new Error('No se encontraron baterías en el servidor'))
          }
        } catch (error) {
          reject(error)
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.setTimeout(5000, () => {
      req.destroy()
      reject(new Error('Timeout al conectar con el servidor'))
    })

    req.end()
  })
}

async function syncBatteriesToSource() {
  try {
    let batteries = []
    
    // Intentar obtener desde el servidor local
    console.log('🔄 Intentando obtener baterías desde el servidor local...')
    try {
      batteries = await fetchBatteriesFromServer()
      console.log(`✅ Obtenidas ${batteries.length} baterías desde el servidor`)
    } catch (serverError) {
      console.log('⚠️  No se pudo conectar al servidor:', serverError.message)
      console.log('📂 Intentando leer desde archivo JSON...')
      
      // Fallback: leer desde JSON
      if (fs.existsSync(BATTERIES_JSON_PATH)) {
        const jsonData = fs.readFileSync(BATTERIES_JSON_PATH, 'utf8')
        const parsed = JSON.parse(jsonData)
        if (Array.isArray(parsed) && parsed.length > 0) {
          batteries = parsed
          console.log(`✅ Leídas ${batteries.length} baterías desde batteries-custom.json`)
        }
      }
    }
    
    if (batteries.length === 0) {
      console.log('❌ No se encontraron baterías para sincronizar')
      console.log('\n💡 Soluciones:')
      console.log('   1. Asegúrate de que el servidor esté corriendo: npm run dev')
      console.log('   2. Ve a http://localhost:3000/admin/batteries y guarda las baterías')
      console.log('   3. O abre http://localhost:3000/sync-batteries-source.html para sincronizar desde localStorage')
      return
    }
    
    // Guardar también en JSON como respaldo
    fs.writeFileSync(BATTERIES_JSON_PATH, JSON.stringify(batteries, null, 2), 'utf8')
    console.log(`💾 Guardadas ${batteries.length} baterías en batteries-custom.json`)
    
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
    
    // Mostrar algunas baterías con imágenes nuevas
    const batteriesWithNewImages = batteries.filter(b => 
      b.image && b.image.includes('/images/batteries/') && 
      !b.image.includes('prius-2004-2009.jpg') && 
      !b.image.includes('prius-2010-2015.jpg') &&
      !b.image.includes('generic-prius-gen4.jpg') &&
      !b.image.includes('prius-c-2012-2017.jpg')
    )
    
    if (batteriesWithNewImages.length > 0) {
      console.log(`\n🖼️  Se encontraron ${batteriesWithNewImages.length} baterías con imágenes personalizadas:`)
      batteriesWithNewImages.slice(0, 5).forEach(b => {
        console.log(`   - ${b.vehicle}: ${b.image}`)
      })
    }
    
    console.log(`\n📝 Próximos pasos:`)
    console.log(`   1. Revisa los cambios: git diff src/data/batteries.ts`)
    console.log(`   2. Haz commit: git add src/data/batteries.ts data/batteries-custom.json`)
    console.log(`   3. Commit: git commit -m "Update batteries with latest images"`)
    console.log(`   4. Despliega: vercel --prod --yes`)
    
  } catch (error) {
    console.error('❌ Error sincronizando baterías:', error)
    process.exit(1)
  }
}

syncBatteriesToSource()

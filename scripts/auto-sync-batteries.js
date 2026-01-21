#!/usr/bin/env node

/**
 * Script automatizado para sincronizar baterías desde localhost a producción
 * 
 * Este script:
 * 1. Lee las baterías desde localStorage (usando una página especial)
 * 2. Las envía directamente a la API de producción
 */

const https = require('https');
const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PRODUCTION_URL = 'https://hybrid-tech-automotive.vercel.app';
const LOCALHOST_URL = 'http://localhost:3000';

console.log('🚀 Iniciando sincronización automática de baterías...\n');

// Función para hacer request HTTP/HTTPS
function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Función para extraer baterías desde localStorage usando puppeteer o similar
// Como no tenemos puppeteer, vamos a crear una página especial que haga esto
async function extractBatteriesFromLocalhost() {
  console.log('📡 Intentando leer baterías desde localhost...');
  
  // Crear una página especial que retorne las baterías como JSON
  const specialPage = `
    <!DOCTYPE html>
    <html>
    <head><title>Battery Export</title></head>
    <body>
      <script>
        const batteries = localStorage.getItem('admin_batteries');
        if (batteries) {
          document.body.innerHTML = '<pre>' + batteries + '</pre>';
        } else {
          document.body.innerHTML = '<p>No hay baterías en localStorage</p>';
        }
      </script>
    </body>
    </html>
  `;
  
  // Guardar página temporal
  const tempFile = path.join(__dirname, '../public/battery-export.html');
  fs.writeFileSync(tempFile, specialPage);
  
  console.log('✅ Página de exportación creada en /battery-export.html');
  console.log('\n📝 Pasos manuales (necesarios):');
  console.log('   1. Abre http://localhost:3000/admin/export-batteries');
  console.log('   2. Haz clic en "Exportar JSON"');
  console.log('   3. Guarda el archivo');
  console.log('   4. Ve a https://hybrid-tech-automotive.vercel.app/admin/export-batteries');
  console.log('   5. Haz clic en "Importar JSON" y selecciona el archivo');
  console.log('   6. Las baterías se sincronizarán automáticamente\n');
  
  return null;
}

// Función para sincronizar a producción
async function syncToProduction(batteries) {
  if (!batteries || batteries.length === 0) {
    console.log('⚠️  No hay baterías para sincronizar');
    return false;
  }

  console.log(`📤 Sincronizando ${batteries.length} baterías a producción...`);

  try {
    const response = await makeRequest(`${PRODUCTION_URL}/api/batteries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }, { batteries });

    if (response.status === 200 && response.data.success) {
      console.log('✅ Baterías sincronizadas correctamente a producción!');
      return true;
    } else {
      console.error('❌ Error al sincronizar:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    return false;
  }
}

// Función principal
async function main() {
  // Intentar leer desde archivo exportado
  const exportFile = path.join(__dirname, '../batteries-export.json');
  
  if (fs.existsSync(exportFile)) {
    console.log('📂 Archivo de exportación encontrado, leyendo...');
    try {
      const batteries = JSON.parse(fs.readFileSync(exportFile, 'utf-8'));
      console.log(`✅ ${batteries.length} baterías leídas desde el archivo`);
      
      // Sincronizar a producción
      await syncToProduction(batteries);
      
      console.log('\n✅ Proceso completado!');
      return;
    } catch (error) {
      console.error('❌ Error al leer el archivo:', error.message);
    }
  }

  // Si no hay archivo, mostrar instrucciones
  await extractBatteriesFromLocalhost();
}

// Ejecutar
main().catch(console.error);

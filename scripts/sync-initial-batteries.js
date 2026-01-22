#!/usr/bin/env node

/**
 * Script para sincronizar las baterías iniciales a producción
 */

const https = require('https');

const PRODUCTION_URL = 'https://hybrid-tech-automotive.vercel.app';

function makeRequest(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = https.request(reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
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

async function syncInitialBatteries() {
  console.log('🚀 Sincronizando baterías iniciales a producción...\n');
  
  // Cargar baterías iniciales desde localhost
  console.log('📡 Cargando baterías iniciales...');
  try {
    const localResponse = await makeRequest('http://localhost:3000/api/initial-batteries');
    
    if (localResponse.status !== 200 || !localResponse.data.success) {
      throw new Error('No se pudieron cargar las baterías iniciales desde localhost');
    }
    
    const batteries = localResponse.data.batteries;
    console.log(`✅ ${batteries.length} baterías cargadas\n`);
    
    // Sincronizar a producción
    console.log('📤 Enviando a producción...');
    const prodResponse = await makeRequest(
      `${PRODUCTION_URL}/api/batteries`,
      { method: 'POST' },
      { batteries }
    );
    
    if (prodResponse.status === 200 && prodResponse.data.success) {
      console.log(`✅ ¡Sincronización exitosa!`);
      console.log(`   ${batteries.length} baterías sincronizadas a producción\n`);
      console.log('🌐 Verifica en: https://hybrid-tech-automotive.vercel.app/batteries');
      return true;
    } else {
      console.error('❌ Error en producción:', prodResponse.data);
      return false;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Error: El servidor local no está corriendo');
      console.log('💡 Inicia el servidor con: npm run dev\n');
      console.log('📝 Alternativa: Ve a http://localhost:3000/admin/sync-now en tu navegador');
    } else {
      console.error('❌ Error:', error.message);
    }
    return false;
  }
}

syncInitialBatteries();

#!/usr/bin/env node

/**
 * Script para sincronizar baterías AHORA desde localhost a producción
 * 
 * Este script:
 * 1. Inicia el servidor local si no está corriendo
 * 2. Abre una página especial que extrae las baterías
 * 3. Las envía directamente a producción
 */

const https = require('https');
const http = require('http');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const PRODUCTION_URL = 'https://hybrid-tech-automotive.vercel.app';
const LOCALHOST_URL = 'http://localhost:3000';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Sincronización Automática de Baterías\n');
console.log('📋 Este script necesita que:');
console.log('   1. El servidor local esté corriendo (localhost:3000)');
console.log('   2. Estés autenticado en el panel de admin');
console.log('   3. Tengas baterías guardadas en localStorage\n');

// Función para hacer request
function makeRequest(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body), raw: body });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, raw: body });
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

// Verificar si el servidor local está corriendo
async function checkLocalhost() {
  try {
    const response = await makeRequest(`${LOCALHOST_URL}/api/batteries`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

// Función principal
async function main() {
  console.log('🔍 Verificando servidor local...');
  
  const isLocalhostRunning = await checkLocalhost();
  
  if (!isLocalhostRunning) {
    console.log('⚠️  El servidor local no está corriendo.');
    console.log('💡 Iniciando servidor local...\n');
    
    // Intentar iniciar el servidor
    try {
      console.log('📦 Ejecutando: npm run dev');
      const devProcess = spawn('npm', ['run', 'dev'], {
        cwd: process.cwd(),
        stdio: 'inherit',
        detached: true
      });
      
      console.log('⏳ Esperando 10 segundos para que el servidor inicie...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    } catch (error) {
      console.error('❌ Error al iniciar el servidor:', error.message);
      console.log('\n📝 Por favor, inicia el servidor manualmente:');
      console.log('   npm run dev');
      process.exit(1);
    }
  }
  
  console.log('✅ Servidor local verificado\n');
  
  console.log('📝 INSTRUCCIONES PARA COMPLETAR LA SINCRONIZACIÓN:\n');
  console.log('   1. Abre tu navegador en: http://localhost:3000/admin/export-batteries');
  console.log('   2. Abre la consola del navegador (F12)');
  console.log('   3. Copia y ejecuta este código en la consola:\n');
  console.log('   ```javascript');
  console.log('   const batteries = JSON.parse(localStorage.getItem("admin_batteries") || "[]");');
  console.log('   if (batteries.length > 0) {');
  console.log('     fetch("https://hybrid-tech-automotive.vercel.app/api/batteries", {');
  console.log('       method: "POST",');
  console.log('       headers: { "Content-Type": "application/json" },');
  console.log('       body: JSON.stringify({ batteries })');
  console.log('     }).then(r => r.json()).then(data => {');
  console.log('       console.log("✅ Sincronizado:", data);');
  console.log('       alert("Baterías sincronizadas a producción!");');
  console.log('     });');
  console.log('   } else {');
  console.log('     alert("No hay baterías en localStorage");');
  console.log('   }');
  console.log('   ```\n');
  
  console.log('   O simplemente:');
  console.log('   1. Haz clic en "Sincronizar al Servidor" en la página de exportación\n');
  
  rl.question('¿Quieres que intente sincronizar automáticamente ahora? (s/n): ', async (answer) => {
    if (answer.toLowerCase() === 's') {
      console.log('\n🔄 Intentando sincronización automática...');
      
      // Intentar leer desde archivo exportado si existe
      const exportFile = path.join(process.cwd(), 'batteries-export.json');
      if (fs.existsSync(exportFile)) {
        console.log('📂 Archivo de exportación encontrado');
        try {
          const batteries = JSON.parse(fs.readFileSync(exportFile, 'utf-8'));
          console.log(`✅ ${batteries.length} baterías leídas`);
          
          console.log('📤 Enviando a producción...');
          const result = await makeRequest(
            `${PRODUCTION_URL}/api/batteries`,
            { method: 'POST' },
            { batteries }
          );
          
          if (result.status === 200 && result.data.success) {
            console.log('✅ ¡Sincronización completada exitosamente!');
            console.log(`   ${result.data.count || batteries.length} baterías sincronizadas`);
          } else {
            console.log('⚠️  Respuesta del servidor:', result.data);
          }
        } catch (error) {
          console.error('❌ Error:', error.message);
        }
      } else {
        console.log('⚠️  No se encontró archivo de exportación.');
        console.log('   Por favor, exporta las baterías primero desde la página de admin.');
      }
    }
    
    rl.close();
  });
}

main().catch(console.error);

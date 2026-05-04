// Script para verificar baterías en localhost vs producción
const https = require('https');

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: e.message, raw: data });
        }
      });
    }).on('error', reject);
  });
}

async function verify() {
  console.log('🔍 Verificando baterías...\n');
  
  console.log('📡 Consultando producción...');
  const prod = await fetchJSON('https://hybrid-tech-automotive.vercel.app/api/batteries');
  console.log(`   Producción: ${prod.batteries?.length || 0} baterías\n`);
  
  console.log('💡 Para sincronizar:');
  console.log('   1. Abre: http://localhost:3000/admin/sync-now');
  console.log('   2. La página sincronizará automáticamente');
  console.log('   3. O ve a: http://localhost:3000/admin/export-batteries');
  console.log('   4. Haz clic en "Sincronizar al Servidor"\n');
}

verify();

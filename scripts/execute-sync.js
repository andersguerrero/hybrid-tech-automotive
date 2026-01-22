#!/usr/bin/env node

/**
 * Script para ejecutar la sincronización de baterías directamente
 * Lee desde localStorage del navegador usando una técnica especial
 */

const https = require('https');
const http = require('http');

const PRODUCTION_URL = 'https://hybrid-tech-automotive.vercel.app';

console.log('🔄 Ejecutando sincronización de baterías...\n');
console.log('📝 INSTRUCCIONES:');
console.log('   1. Abre tu navegador en: http://localhost:3000/admin/export-batteries');
console.log('   2. Abre la consola del navegador (F12)');
console.log('   3. Copia y pega este código:\n');
console.log(`
// Código para copiar en la consola del navegador:
(async () => {
  const batteries = JSON.parse(localStorage.getItem('admin_batteries') || '[]');
  if (batteries.length === 0) {
    console.error('No hay baterías en localStorage');
    return;
  }
  console.log('Sincronizando', batteries.length, 'baterías...');
  const response = await fetch('${PRODUCTION_URL}/api/batteries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batteries })
  });
  const data = await response.json();
  if (data.success) {
    console.log('✅ Sincronización exitosa!', batteries.length, 'baterías');
    alert('✅ Sincronización exitosa! ' + batteries.length + ' baterías');
  } else {
    console.error('❌ Error:', data.error);
    alert('❌ Error: ' + data.error);
  }
})();
`);
console.log('\n   4. Presiona ENTER para ejecutar');
console.log('   5. Verifica en: https://hybrid-tech-automotive.vercel.app/batteries\n');

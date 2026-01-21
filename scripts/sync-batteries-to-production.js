#!/usr/bin/env node

/**
 * Script para sincronizar baterías desde localStorage local a producción
 * 
 * Uso:
 * 1. Abre el navegador en localhost:3000/admin/export-batteries
 * 2. Copia el JSON de las baterías desde la consola del navegador
 * 3. Ejecuta este script con el JSON como argumento
 * 
 * O mejor: usa la página de admin que creamos
 */

const fs = require('fs');
const path = require('path');

// Leer las baterías desde un archivo JSON exportado
const exportFile = process.argv[2] || path.join(__dirname, '../batteries-export.json');

if (!fs.existsSync(exportFile)) {
  console.error('❌ No se encontró el archivo de exportación:', exportFile);
  console.log('\n📝 Para exportar las baterías:');
  console.log('   1. Ve a http://localhost:3000/admin/export-batteries');
  console.log('   2. Haz clic en "Exportar JSON"');
  console.log('   3. Guarda el archivo como batteries-export.json en la raíz del proyecto');
  console.log('   4. Ejecuta este script nuevamente');
  process.exit(1);
}

try {
  const batteriesData = JSON.parse(fs.readFileSync(exportFile, 'utf-8'));
  
  if (!Array.isArray(batteriesData)) {
    throw new Error('El archivo no contiene un array de baterías');
  }

  console.log(`✅ Encontradas ${batteriesData.length} baterías`);
  console.log('\n📤 Para importar en producción:');
  console.log('   1. Ve a https://hybrid-tech-automotive.vercel.app/admin/export-batteries');
  console.log('   2. Haz clic en "Importar JSON"');
  console.log('   3. Selecciona el archivo:', exportFile);
  console.log('   4. Las baterías se guardarán automáticamente');
  
  // También podemos crear un script que haga la importación automáticamente
  console.log('\n💡 Alternativa: Usa la página de admin para sincronizar directamente');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

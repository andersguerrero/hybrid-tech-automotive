#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Iniciando despliegue automático de Hybrid Tech Automotive...\n');

// Verificar si Vercel está instalado
try {
  execSync('vercel --version', { stdio: 'ignore' });
  console.log('✅ Vercel CLI está instalado\n');
} catch (e) {
  console.log('📦 Instalando Vercel CLI...');
  execSync('npm install -g vercel@latest', { stdio: 'inherit' });
}

// Verificar autenticación
try {
  execSync('vercel whoami', { stdio: 'ignore' });
  console.log('✅ Autenticado en Vercel\n');
} catch (e) {
  console.log('🔐 Necesitas autenticarte en Vercel.');
  console.log('📌 Se abrirá tu navegador para autenticarte...\n');
  
  rl.question('Presiona ENTER cuando hayas completado la autenticación...', () => {
    rl.close();
    deploy();
  });
  return;
}

deploy();

function deploy() {
  console.log('\n🌐 Desplegando a Vercel en producción...\n');
  
  try {
    const result = execSync('vercel --prod --yes', { 
      stdio: 'inherit',
      encoding: 'utf8'
    });
    console.log('\n✅ ¡Despliegue completado exitosamente!');
  } catch (e) {
    console.error('\n❌ Error durante el despliegue:', e.message);
    process.exit(1);
  }
}

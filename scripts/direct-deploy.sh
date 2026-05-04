#!/bin/bash

echo "🚀 Despliegue Directo de Hybrid Tech Automotive"
echo ""

# Verificar build
if [ ! -d ".next" ]; then
    echo "📦 Construyendo proyecto..."
    npm run build
fi

echo "✅ Build verificado"
echo ""
echo "🌐 Iniciando despliegue en Vercel..."
echo ""
echo "📌 IMPORTANTE:"
echo "   1. Se abrirá tu navegador automáticamente"
echo "   2. Haz clic en 'Login with GitHub' o crea una cuenta gratis"
echo "   3. El despliegue continuará automáticamente"
echo ""
echo "   URL de autenticación: https://vercel.com/login"
echo ""
echo "Presiona Ctrl+C para cancelar o espera..."
sleep 3

# Intentar desplegar
vercel --prod --yes

echo ""
echo "✅ Despliegue completado!"

#!/bin/bash

echo "🚀 Iniciando despliegue de Hybrid Tech Automotive..."

# Verificar si Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel@latest
fi

# Verificar si está autenticado
if ! vercel whoami &> /dev/null; then
    echo "🔐 Necesitas autenticarte en Vercel..."
    echo "Se abrirá tu navegador para autenticarte..."
    vercel login
fi

# Desplegar
echo "🌐 Desplegando a Vercel..."
vercel --prod --yes

echo "✅ ¡Despliegue completado!"

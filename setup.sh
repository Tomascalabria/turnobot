#!/bin/bash
set -e

echo "🚀 Configurando Turnobot..."

# Verificar dependencias
command -v node  >/dev/null 2>&1 || { echo "❌ Node.js no encontrado"; exit 1; }
command -v npm   >/dev/null 2>&1 || { echo "❌ npm no encontrado"; exit 1; }
command -v psql  >/dev/null 2>&1 || echo "⚠️  psql no encontrado (necesitás PostgreSQL)"

# Copiar .env si no existe
if [ ! -f .env ]; then
  cp .env.example .env
  echo "📋 .env creado desde .env.example — completalo antes de continuar"
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Generar cliente Prisma
echo "🔧 Generando cliente Prisma..."
npm run db:generate

echo ""
echo "✅ Setup completo!"
echo ""
echo "Próximos pasos:"
echo "  1. Completar las variables en .env"
echo "  2. npm run db:migrate   → crear tablas en Postgres"
echo "  3. npm run db:seed      → datos de prueba"
echo "  4. npm run dev:bot      → iniciar Express (puerto 3001)"
echo "  5. npm run dev:web      → iniciar Next.js (puerto 3000)"
echo "  6. ngrok http 3001      → túnel para webhook WA y OAuth"

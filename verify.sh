#!/bin/bash

echo "🔍 Verificando Turnobot..."
ERRORS=0

check() {
  if [ -e "$1" ]; then
    echo "  ✅ $1"
  else
    echo "  ❌ $1 — FALTA"
    ERRORS=$((ERRORS+1))
  fi
}

echo ""
echo "── Raíz ──────────────────────────────"
check "package.json"
check ".env"
check ".gitignore"

echo ""
echo "── packages/db ───────────────────────"
check "packages/db/package.json"
check "packages/db/prisma/schema.prisma"
check "packages/db/prisma/seed.js"
check "packages/db/index.js"

echo ""
echo "── apps/bot ──────────────────────────"
check "apps/bot/package.json"
check "apps/bot/src/index.js"
check "apps/bot/src/routes/whatsapp.js"
check "apps/bot/src/routes/calendar.js"
check "apps/bot/src/routes/mercadopago.js"
check "apps/bot/src/routes/panel.js"
check "apps/bot/src/services/conversation.js"
check "apps/bot/src/services/whatsapp.js"
check "apps/bot/src/services/calendar.js"
check "apps/bot/src/services/mercadopago.js"
check "apps/bot/src/services/session.js"
check "apps/bot/src/utils/format.js"

echo ""
echo "── apps/web ──────────────────────────"
check "apps/web/package.json"
check "apps/web/next.config.js"
check "apps/web/tsconfig.json"
check "apps/web/middleware.ts"
check "apps/web/lib/auth.ts"
check "apps/web/lib/prisma.ts"
check "apps/web/types/index.ts"
check "apps/web/app/layout.tsx"
check "apps/web/app/SessionProvider.tsx"
check "apps/web/app/(public)/login/page.tsx"
check "apps/web/app/(public)/register/page.tsx"
check "apps/web/app/(dashboard)/layout.tsx"
check "apps/web/app/(dashboard)/dashboard/page.tsx"
check "apps/web/app/api/auth/[...nextauth]/route.ts"
check "apps/web/app/api/register/route.ts"
check "apps/web/app/api/panel/[...path]/route.ts"
check "apps/web/app/_admin/page.tsx"
check "apps/web/app/_admin/login/page.tsx"
check "apps/web/app/_admin/AdminDashboardClient.tsx"
check "apps/web/components/DashboardNav.tsx"

echo ""
if [ $ERRORS -eq 0 ]; then
  echo "✅ Todo en orden — $ERRORS errores"
else
  echo "❌ Hay $ERRORS archivo(s) faltante(s)"
fi

# Turnobot

Bot de WhatsApp para gestión de turnos médicos con panel web para profesionales.

## Stack

- **Bot**: Node.js + Express + WhatsApp Cloud API + Google Calendar + MercadoPago
- **Web**: Next.js 14 + NextAuth + Tailwind CSS
- **DB**: PostgreSQL + Prisma (monorepo compartido)
- **Sessions**: Redis

## Setup rápido

```bash
cp .env.example .env
# Completar variables en .env

npm install
npm run db:migrate
npm run db:seed

# Terminal 1 – bot Express
npm run dev:bot

# Terminal 2 – Next.js
npm run dev:web

# Terminal 3 – túnel ngrok
ngrok http 3001
```

Después de obtener la URL de ngrok:
1. Actualizar `GOOGLE_REDIRECT_URI` y `MP_REDIRECT_URI` en `.env`
2. Configurar el webhook de WhatsApp en Meta Developers con `https://<ngrok>/api/whatsapp/webhook`
3. Verificar con el token `WA_VERIFY_TOKEN`

## Estructura

```
turnobot/
├── packages/db/          ← Prisma schema compartido
├── apps/bot/             ← Express (puerto 3001)
└── apps/web/             ← Next.js (puerto 3000)
```

## Semanas

- **Semana 1** ✅ Estructura del monorepo + DB
- **Semana 2** ✅ WhatsApp webhook + Google Calendar OAuth
- **Semana 3** – MercadoPago split payments + máquina de estados completa
- **Semana 4** – Panel web completo (servicios, turnos, config bot, plan)

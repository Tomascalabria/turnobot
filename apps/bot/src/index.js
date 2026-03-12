require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') })
const express = require('express')

const whatsappRouter = require('./routes/whatsapp')
const calendarRouter = require('./routes/calendar')
const mercadopagoRouter = require('./routes/mercadopago')
const panelRouter = require('./routes/panel')

const app = express()

app.use(express.json())

// Salud
app.get('/health', (_req, res) => res.json({ ok: true }))

// Rutas
app.use('/api/whatsapp', whatsappRouter)
app.use('/api/calendar', calendarRouter)
app.use('/api/mercadopago', mercadopagoRouter)
app.use('/api/panel', panelRouter)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🤖 Bot server corriendo en http://localhost:${PORT}`)
  console.log(`   Webhook WA: http://localhost:${PORT}/api/whatsapp/webhook`)
  console.log(`   Calendar OAuth: http://localhost:${PORT}/api/calendar/connect`)
})

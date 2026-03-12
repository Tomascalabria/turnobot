/**
 * Rutas del webhook de WhatsApp (Meta Cloud API)
 *
 * GET  /api/whatsapp/webhook  → verificación del webhook (Meta valida el token)
 * POST /api/whatsapp/webhook  → recepción de mensajes entrantes
 */
const express = require('express')
const router = express.Router()
const conversationService = require('../services/conversation')

// ── Verificación del webhook ───────────────────────────────────────────────
// Meta llama a este endpoint con hub.challenge cuando configurás el webhook
router.get('/webhook', (req, res) => {
  const mode      = req.query['hub.mode']
  const token     = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && token === process.env.WA_VERIFY_TOKEN) {
    console.log('✅ Webhook de WhatsApp verificado')
    return res.status(200).send(challenge)
  }
  console.warn('⚠️  Token de verificación incorrecto:', token)
  res.sendStatus(403)
})

// ── Recepción de mensajes ──────────────────────────────────────────────────
router.post('/webhook', async (req, res) => {
  // Responder 200 inmediatamente para que Meta no reintente
  res.sendStatus(200)

  try {
    const body = req.body

    // Meta envuelve todo en entry[].changes[]
    if (body.object !== 'whatsapp_business_account') return

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== 'messages') continue

        const value    = change.value
        const messages = value.messages || []
        const contacts = value.contacts || []

        for (const message of messages) {
          const from        = message.from          // número del paciente (ej. 5491112345678)
          const messageId   = message.id
          const messageType = message.type           // text | audio | image | ...
          const timestamp   = message.timestamp

          // Solo procesamos mensajes de texto por ahora
          if (messageType !== 'text') {
            console.log(`ℹ️  Mensaje tipo "${messageType}" ignorado de ${from}`)
            continue
          }

          const text        = message.text.body
          const contactName = contacts.find(c => c.wa_id === from)?.profile?.name || 'Paciente'

          console.log(`📩 [${from}] ${contactName}: ${text}`)

          // Derivar al servicio de conversación (máquina de estados)
          await conversationService.handleMessage({
            from,
            text,
            contactName,
            messageId,
            timestamp,
            phoneNumberId: value.metadata?.phone_number_id
          })
        }
      }
    }
  } catch (err) {
    console.error('❌ Error procesando webhook WA:', err)
  }
})

module.exports = router

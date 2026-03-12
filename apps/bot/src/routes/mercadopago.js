/**
 * Rutas de MercadoPago
 *
 * GET  /api/mercadopago/connect        → inicia OAuth del profesional
 * GET  /api/mercadopago/callback       → recibe el code, intercambia tokens
 * POST /api/mercadopago/webhook        → notificaciones de pago
 */
const express = require('express')
const router  = express.Router()
const mpService = require('../services/mercadopago')

// ── OAuth ──────────────────────────────────────────────────────────────────
router.get('/connect', (req, res) => {
  const { professionalId } = req.query
  if (!professionalId) return res.status(400).json({ error: 'Falta professionalId' })

  const authUrl = mpService.getAuthUrl(professionalId)
  res.redirect(authUrl)
})

router.get('/callback', async (req, res) => {
  const { code, state: professionalId } = req.query
  if (!code || !professionalId) return res.status(400).send('Faltan parámetros')

  try {
    await mpService.handleCallback(code, professionalId)
    res.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard?mpConnected=1`
    )
  } catch (err) {
    console.error('❌ Error en callback de MP:', err)
    res.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard?mpError=server`
    )
  }
})

// ── Webhook de pagos ───────────────────────────────────────────────────────
router.post('/webhook', async (req, res) => {
  res.sendStatus(200) // responder antes de procesar

  try {
    const { type, data } = req.body
    if (type === 'payment') {
      await mpService.handlePaymentNotification(data.id)
    }
  } catch (err) {
    console.error('❌ Error en webhook de MP:', err)
  }
})

module.exports = router

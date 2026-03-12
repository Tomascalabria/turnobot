/**
 * Rutas de Google Calendar OAuth
 *
 * GET /api/calendar/connect          → redirige al consentimiento de Google
 * GET /api/calendar/callback         → recibe el code, intercambia tokens, guarda en DB
 * GET /api/calendar/disconnect/:id   → revoca y borra los tokens del profesional
 */
const express = require('express')
const router  = express.Router()
const calendarService = require('../services/calendar')

// ── 1. Iniciar flujo OAuth ─────────────────────────────────────────────────
// El panel web redirige al profesional a este endpoint con su ID en el estado
// Ej: GET /api/calendar/connect?professionalId=cuid123
router.get('/connect', (req, res) => {
  const { professionalId } = req.query

  if (!professionalId) {
    return res.status(400).json({ error: 'Falta professionalId' })
  }

  const authUrl = calendarService.getAuthUrl(professionalId)
  res.redirect(authUrl)
})

// ── 2. Callback de Google ──────────────────────────────────────────────────
// Google redirige aquí con ?code=...&state=professionalId
router.get('/callback', async (req, res) => {
  const { code, state: professionalId, error } = req.query

  if (error) {
    console.warn('⚠️  Google Calendar OAuth rechazado:', error)
    return res.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard?calendarError=${error}`
    )
  }

  if (!code || !professionalId) {
    return res.status(400).send('Faltan parámetros code o state')
  }

  try {
    await calendarService.handleCallback(code, professionalId)
    console.log(`✅ Google Calendar conectado para profesional ${professionalId}`)
    res.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard?calendarConnected=1`
    )
  } catch (err) {
    console.error('❌ Error en callback de Calendar:', err)
    res.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard?calendarError=server`
    )
  }
})

// ── 3. Desconectar Calendar ────────────────────────────────────────────────
router.delete('/disconnect/:professionalId', async (req, res) => {
  try {
    await calendarService.disconnect(req.params.professionalId)
    res.json({ ok: true })
  } catch (err) {
    console.error('❌ Error desconectando Calendar:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router

/**
 * API interna que consume el panel Next.js
 * Protegida con BOT_API_SECRET en el header x-api-secret
 *
 * GET  /api/panel/professionals/:id/appointments
 * GET  /api/panel/professionals/:id/services
 * POST /api/panel/professionals/:id/services
 * PUT  /api/panel/services/:id
 * DELETE /api/panel/services/:id
 */
const express = require('express')
const router  = express.Router()
const { prisma } = require('@turnobot/db')

// ── Middleware de autenticación interna ───────────────────────────────────
router.use((req, res, next) => {
  const secret = req.headers['x-api-secret']
  if (secret !== process.env.BOT_API_SECRET) {
    return res.status(401).json({ error: 'No autorizado' })
  }
  next()
})

// ── Turnos ─────────────────────────────────────────────────────────────────
router.get('/professionals/:id/appointments', async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { professionalId: req.params.id },
      include: { service: true },
      orderBy: { startAt: 'asc' }
    })
    res.json(appointments)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Servicios ──────────────────────────────────────────────────────────────
router.get('/professionals/:id/services', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { professionalId: req.params.id },
      orderBy: { createdAt: 'asc' }
    })
    res.json(services)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/professionals/:id/services', async (req, res) => {
  try {
    const service = await prisma.service.create({
      data: { ...req.body, professionalId: req.params.id }
    })
    res.status(201).json(service)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/services/:id', async (req, res) => {
  try {
    const service = await prisma.service.update({
      where: { id: req.params.id },
      data: req.body
    })
    res.json(service)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/services/:id', async (req, res) => {
  try {
    await prisma.service.delete({ where: { id: req.params.id } })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router

/**
 * Google Calendar OAuth + operaciones de calendario
 *
 * Flujo OAuth:
 *   1. getAuthUrl(professionalId)  → URL de consentimiento de Google
 *   2. handleCallback(code, id)    → intercambia code por tokens, guarda en DB
 *   3. getClient(professionalId)   → devuelve un OAuth2Client listo para usar
 *
 * Operaciones:
 *   - getAvailableSlots(professionalId, date, durationMin)
 *   - createEvent(professionalId, appointment)
 *   - deleteEvent(professionalId, gcEventId)
 */
const { google }  = require('googleapis')
const { prisma }  = require('@turnobot/db')

function buildOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
}

// ── OAuth ──────────────────────────────────────────────────────────────────
function getAuthUrl(professionalId) {
  const oauth2Client = buildOAuth2Client()
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // forzar refresh_token siempre
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ],
    state: professionalId
  })
}

async function handleCallback(code, professionalId) {
  const oauth2Client = buildOAuth2Client()
  const { tokens }   = await oauth2Client.getToken(code)

  // Obtener el calendario primario del usuario para guardar su ID
  oauth2Client.setCredentials(tokens)
  const calendar    = google.calendar({ version: 'v3', auth: oauth2Client })
  const calResponse = await calendar.calendarList.get({ calendarId: 'primary' })
  const calendarId  = calResponse.data.id

  await prisma.professional.update({
    where: { id: professionalId },
    data: {
      googleAccessToken:  tokens.access_token,
      googleRefreshToken: tokens.refresh_token || undefined, // no sobrescribir si es null
      googleTokenExpiry:  tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      googleCalendarId:   calendarId
    }
  })
}

async function disconnect(professionalId) {
  const prof = await prisma.professional.findUnique({
    where: { id: professionalId },
    select: { googleAccessToken: true }
  })

  if (prof?.googleAccessToken) {
    try {
      const oauth2Client = buildOAuth2Client()
      oauth2Client.setCredentials({ access_token: prof.googleAccessToken })
      await oauth2Client.revokeCredentials()
    } catch (_) {
      // Si el token ya expiró, ignoramos el error de revocación
    }
  }

  await prisma.professional.update({
    where: { id: professionalId },
    data: {
      googleAccessToken:  null,
      googleRefreshToken: null,
      googleTokenExpiry:  null
    }
  })
}

// ── Obtener client autenticado ─────────────────────────────────────────────
async function getClient(professionalId) {
  const prof = await prisma.professional.findUnique({
    where: { id: professionalId },
    select: {
      googleAccessToken:  true,
      googleRefreshToken: true,
      googleTokenExpiry:  true
    }
  })

  if (!prof?.googleAccessToken) {
    throw new Error(`Profesional ${professionalId} no tiene Google Calendar conectado`)
  }

  const oauth2Client = buildOAuth2Client()
  oauth2Client.setCredentials({
    access_token:  prof.googleAccessToken,
    refresh_token: prof.googleRefreshToken,
    expiry_date:   prof.googleTokenExpiry ? prof.googleTokenExpiry.getTime() : undefined
  })

  // Auto-guardar tokens renovados
  oauth2Client.on('tokens', async (tokens) => {
    await prisma.professional.update({
      where: { id: professionalId },
      data: {
        googleAccessToken: tokens.access_token,
        ...(tokens.refresh_token && { googleRefreshToken: tokens.refresh_token }),
        ...(tokens.expiry_date   && { googleTokenExpiry: new Date(tokens.expiry_date) })
      }
    })
  })

  return oauth2Client
}

// ── Slots disponibles ──────────────────────────────────────────────────────
// Devuelve arreglo de { start: Date, end: Date } libres en la fecha dada
async function getAvailableSlots(professionalId, date, durationMin) {
  const prof = await prisma.professional.findUnique({
    where:   { id: professionalId },
    include: { botConfig: true }
  })

  const config     = prof.botConfig
  const calendarId = prof.googleCalendarId || 'primary'

  // Rango del día
  const [startH, startM] = (config?.workdayStart || '09:00').split(':').map(Number)
  const [endH,   endM]   = (config?.workdayEnd   || '18:00').split(':').map(Number)

  const dayStart = new Date(date)
  dayStart.setHours(startH, startM, 0, 0)
  const dayEnd = new Date(date)
  dayEnd.setHours(endH, endM, 0, 0)

  // Consultar eventos ocupados con freebusy
  const auth     = await getClient(professionalId)
  const calendar = google.calendar({ version: 'v3', auth })

  const freebusy = await calendar.freebusy.query({
    requestBody: {
      timeMin: dayStart.toISOString(),
      timeMax: dayEnd.toISOString(),
      items:   [{ id: calendarId }]
    }
  })

  const busy = freebusy.data.calendars[calendarId]?.busy || []

  // Generar slots y filtrar los que choquen con eventos ocupados
  const slotGap  = (config?.slotGapMin || 0) * 60 * 1000
  const duration = durationMin * 60 * 1000
  const slots    = []

  let cursor = dayStart.getTime()
  while (cursor + duration <= dayEnd.getTime()) {
    const slotEnd = cursor + duration
    const overlap = busy.some(b => {
      const bs = new Date(b.start).getTime()
      const be = new Date(b.end).getTime()
      return cursor < be && slotEnd > bs
    })

    if (!overlap) {
      slots.push({ start: new Date(cursor), end: new Date(slotEnd) })
    }
    cursor = slotEnd + slotGap
  }

  return slots
}

// ── Crear evento ───────────────────────────────────────────────────────────
async function createEvent(professionalId, appointment) {
  const prof = await prisma.professional.findUnique({
    where:  { id: professionalId },
    select: { googleCalendarId: true }
  })
  const calendarId = prof.googleCalendarId || 'primary'

  const auth     = await getClient(professionalId)
  const calendar = google.calendar({ version: 'v3', auth })

  const event = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary:     `Turno: ${appointment.patientName}`,
      description: `Servicio: ${appointment.service?.name || ''}\nTel: ${appointment.patientPhone}`,
      start: { dateTime: appointment.startAt.toISOString() },
      end:   { dateTime: appointment.endAt.toISOString() },
      reminders: {
        useDefault: false,
        overrides: [{ method: 'email', minutes: 1440 }, { method: 'popup', minutes: 60 }]
      }
    }
  })

  return event.data.id
}

// ── Eliminar evento ────────────────────────────────────────────────────────
async function deleteEvent(professionalId, gcEventId) {
  const prof = await prisma.professional.findUnique({
    where:  { id: professionalId },
    select: { googleCalendarId: true }
  })
  const calendarId = prof.googleCalendarId || 'primary'

  const auth     = await getClient(professionalId)
  const calendar = google.calendar({ version: 'v3', auth })

  await calendar.events.delete({ calendarId, eventId: gcEventId })
}

module.exports = { getAuthUrl, handleCallback, disconnect, getClient, getAvailableSlots, createEvent, deleteEvent }

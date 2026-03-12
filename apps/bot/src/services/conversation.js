/**
 * Máquina de estados del bot de WhatsApp
 *
 * Estados:
 *  IDLE           → esperando que el usuario inicie
 *  SELECTING_SERVICE → elige qué servicio quiere
 *  SELECTING_DATE → elige fecha
 *  SELECTING_TIME → elige horario
 *  CONFIRMING     → confirmación final antes de crear el turno
 *  DONE           → turno creado, conversación terminada
 *
 * Semana 2: flujo básico con selección de servicio, fecha y hora
 * Semana 3: se agrega el pago de seña antes de DONE
 */
const { prisma }    = require('@turnobot/db')
const sessionSvc    = require('./session')
const waSvc         = require('./whatsapp')
const calendarSvc   = require('./calendar')
const { formatDate, formatTime, formatCurrency } = require('../utils/format')

// ── Helpers ────────────────────────────────────────────────────────────────

async function getProfessionalByPhone(phone) {
  // Por ahora hay un único profesional demo; en semana 4 se resuelve por número WA
  return prisma.professional.findFirst({
    include: { services: { where: { active: true } }, botConfig: true }
  })
}

function nextDays(n = 7) {
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 1; i <= n; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d)
  }
  return days
}

// ── Manejador principal ────────────────────────────────────────────────────

async function handleMessage({ from, text, contactName }) {
  let session = await sessionSvc.getSession(from)

  if (!session) {
    session = { state: 'IDLE', context: {} }
  }

  const state = session.state
  const ctx   = session.context

  // ── IDLE ─────────────────────────────────────────────────────────────────
  if (state === 'IDLE') {
    const prof = await getProfessionalByPhone(from)
    if (!prof) {
      await waSvc.sendText(from, 'Lo sentimos, el servicio no está disponible en este momento.')
      return
    }

    ctx.professionalId = prof.id
    const greeting = (prof.botConfig?.greetingMsg || '¡Hola! Soy el asistente de {profesional}. ¿En qué puedo ayudarte?')
      .replace('{profesional}', prof.name)

    if (prof.services.length === 0) {
      await waSvc.sendText(from, `${greeting}\n\nLo sentimos, no hay servicios disponibles en este momento.`)
      return
    }

    const sections = [{
      title: 'Nuestros servicios',
      rows: prof.services.map(s => ({
        id:          `service:${s.id}`,
        title:       s.name,
        description: `${formatCurrency(s.price)} · ${s.durationMin} min`
      }))
    }]

    await waSvc.sendText(from, greeting)
    await waSvc.sendList(from, {
      header:      '¿Qué servicio necesitás?',
      body:        'Seleccioná una opción de la lista',
      footer:      'Respondé para ver los horarios disponibles',
      buttonLabel: 'Ver servicios',
      sections
    })

    session.state = 'SELECTING_SERVICE'
    await sessionSvc.setSession(from, session)
    return
  }

  // ── SELECTING_SERVICE ─────────────────────────────────────────────────────
  if (state === 'SELECTING_SERVICE') {
    // El usuario puede enviar el texto del servicio o el ID de la lista interactiva
    const prof = await prisma.professional.findUnique({
      where:   { id: ctx.professionalId },
      include: { services: { where: { active: true } } }
    })

    // Buscar por nombre (fallback de texto libre)
    const selected = prof.services.find(s =>
      text.toLowerCase().includes(s.name.toLowerCase()) ||
      text.includes(`service:${s.id}`)
    )

    if (!selected) {
      await waSvc.sendText(from, 'No entendí tu elección. Por favor seleccioná un servicio de la lista.')
      return
    }

    ctx.serviceId   = selected.id
    ctx.serviceName = selected.name
    ctx.durationMin = selected.durationMin

    // Mostrar próximos 7 días como opciones
    const days = nextDays(7)
    const sections = [{
      title: 'Próximas fechas',
      rows: days.map((d, i) => ({
        id:    `date:${d.toISOString().split('T')[0]}`,
        title: formatDate(d)
      }))
    }]

    await waSvc.sendList(from, {
      header:      '¿Qué día querés?',
      body:        `Servicio elegido: *${selected.name}*`,
      buttonLabel: 'Ver fechas',
      sections
    })

    session.state = 'SELECTING_DATE'
    await sessionSvc.setSession(from, session)
    return
  }

  // ── SELECTING_DATE ────────────────────────────────────────────────────────
  if (state === 'SELECTING_DATE') {
    // Extraer fecha del mensaje (formato date:YYYY-MM-DD o texto libre)
    const dateMatch = text.match(/date:(\d{4}-\d{2}-\d{2})/) ||
                      text.match(/(\d{4}-\d{2}-\d{2})/)

    if (!dateMatch) {
      await waSvc.sendText(from, 'No pude interpretar la fecha. Por favor elegí de la lista.')
      return
    }

    const dateStr = dateMatch[1]
    const date    = new Date(dateStr + 'T00:00:00')

    // Verificar que el día está habilitado por el profesional
    const prof = await prisma.professional.findUnique({
      where:   { id: ctx.professionalId },
      include: { botConfig: true }
    })
    const workdays = prof.botConfig?.workdays || [1,2,3,4,5]
    if (!workdays.includes(date.getDay())) {
      await waSvc.sendText(from, `Lo sentimos, el ${formatDate(date)} no atendemos. Por favor elegí otro día.`)
      return
    }

    ctx.date = dateStr

    // Buscar slots disponibles
    let slots = []
    try {
      if (prof.googleCalendarId) {
        slots = await calendarSvc.getAvailableSlots(ctx.professionalId, date, ctx.durationMin)
      } else {
        // Sin Calendar conectado: generar slots fijos cada 30 min
        const [sh, sm] = (prof.botConfig?.workdayStart || '09:00').split(':').map(Number)
        const [eh, em] = (prof.botConfig?.workdayEnd   || '18:00').split(':').map(Number)
        let cursor = new Date(date); cursor.setHours(sh, sm, 0, 0)
        const end  = new Date(date); end.setHours(eh, em, 0, 0)
        while (cursor.getTime() + ctx.durationMin * 60000 <= end.getTime()) {
          slots.push({ start: new Date(cursor), end: new Date(cursor.getTime() + ctx.durationMin * 60000) })
          cursor = new Date(cursor.getTime() + ctx.durationMin * 60000)
        }
      }
    } catch (err) {
      console.error('Error obteniendo slots:', err)
    }

    if (slots.length === 0) {
      await waSvc.sendText(from, `No hay horarios disponibles para el ${formatDate(date)}. ¿Querés elegir otro día?`)
      return
    }

    ctx.slots = slots.map(s => ({
      start: s.start.toISOString(),
      end:   s.end.toISOString()
    }))

    const sections = [{
      title: `Horarios del ${formatDate(date)}`,
      rows: slots.slice(0, 10).map((s, i) => ({
        id:    `time:${i}`,
        title: formatTime(s.start)
      }))
    }]

    await waSvc.sendList(from, {
      header:      '¿A qué hora?',
      body:        `Turno de ${ctx.durationMin} minutos`,
      buttonLabel: 'Ver horarios',
      sections
    })

    session.state = 'SELECTING_TIME'
    await sessionSvc.setSession(from, session)
    return
  }

  // ── SELECTING_TIME ────────────────────────────────────────────────────────
  if (state === 'SELECTING_TIME') {
    const timeMatch = text.match(/time:(\d+)/)
    const slotIndex = timeMatch ? parseInt(timeMatch[1]) : null

    if (slotIndex === null || !ctx.slots[slotIndex]) {
      await waSvc.sendText(from, 'No pude interpretar el horario. Por favor elegí de la lista.')
      return
    }

    ctx.slotIndex = slotIndex
    const slot = ctx.slots[slotIndex]

    await waSvc.sendButtons(from, {
      body: `Resumen del turno:\n\n*Servicio:* ${ctx.serviceName}\n*Fecha:* ${formatDate(new Date(slot.start))}\n*Hora:* ${formatTime(new Date(slot.start))}\n\n¿Confirmamos?`,
      buttons: [
        { id: 'confirm:yes', title: '✅ Confirmar' },
        { id: 'confirm:no',  title: '❌ Cancelar'  }
      ]
    })

    session.state = 'CONFIRMING'
    await sessionSvc.setSession(from, session)
    return
  }

  // ── CONFIRMING ────────────────────────────────────────────────────────────
  if (state === 'CONFIRMING') {
    if (text.includes('confirm:no') || /cancel/i.test(text) || text === '❌ Cancelar') {
      await waSvc.sendText(from, 'Turno cancelado. Si querés pedir uno nuevo, escribime cuando quieras. 😊')
      await sessionSvc.deleteSession(from)
      return
    }

    if (!text.includes('confirm:yes') && !/confirm/i.test(text) && text !== '✅ Confirmar') {
      await waSvc.sendText(from, 'Por favor respondé *Confirmar* o *Cancelar*.')
      return
    }

    const slot = ctx.slots[ctx.slotIndex]

    // Crear el turno en la DB
    const appointment = await prisma.appointment.create({
      data: {
        professionalId: ctx.professionalId,
        serviceId:      ctx.serviceId,
        patientName:    contactName || 'Paciente',
        patientPhone:   from,
        startAt:        new Date(slot.start),
        endAt:          new Date(slot.end),
        status:         'CONFIRMED',
        totalAmount:    0, // se completa en semana 3 con el precio real
        depositAmount:  0
      },
      include: { service: true }
    })

    // Crear evento en Google Calendar si está conectado
    const prof = await prisma.professional.findUnique({
      where: { id: ctx.professionalId }
    })

    if (prof.googleCalendarId) {
      try {
        const gcEventId = await calendarSvc.createEvent(ctx.professionalId, appointment)
        await prisma.appointment.update({
          where: { id: appointment.id },
          data:  { gcEventId }
        })
      } catch (err) {
        console.error('Error creando evento en Calendar:', err)
        // No fallar el turno si Calendar falla
      }
    }

    const confirmMsg = (prof.botConfig?.confirmMsg || 'Tu turno fue confirmado para el {fecha} a las {hora}. ¡Te esperamos!')
      .replace('{fecha}', formatDate(new Date(slot.start)))
      .replace('{hora}',  formatTime(new Date(slot.start)))

    await waSvc.sendText(from, confirmMsg)
    await sessionSvc.deleteSession(from)
    return
  }

  // ── Estado desconocido: reiniciar ─────────────────────────────────────────
  await sessionSvc.deleteSession(from)
  await handleMessage({ from, text: 'hola', contactName })
}

module.exports = { handleMessage }

/**
 * Helpers de formato: fechas y moneda (en español, zona horaria Argentina)
 */

const LOCALE = 'es-AR'
const TZ     = 'America/Argentina/Buenos_Aires'

function formatDate(date) {
  return new Date(date).toLocaleDateString(LOCALE, {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    timeZone: TZ
  })
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString(LOCALE, {
    hour:     '2-digit',
    minute:   '2-digit',
    hour12:   false,
    timeZone: TZ
  })
}

function formatCurrency(amount) {
  return new Intl.NumberFormat(LOCALE, {
    style:    'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(amount)
}

module.exports = { formatDate, formatTime, formatCurrency }

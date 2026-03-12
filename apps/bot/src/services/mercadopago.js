/**
 * MercadoPago OAuth + split payments (semana 3)
 * Por ahora: OAuth básico para conectar la cuenta del profesional
 */
const axios   = require('axios')
const { prisma } = require('@turnobot/db')

const MP_AUTH_URL  = 'https://auth.mercadopago.com/authorization'
const MP_TOKEN_URL = 'https://api.mercadopago.com/oauth/token'

function getAuthUrl(professionalId) {
  const params = new URLSearchParams({
    client_id:     process.env.MP_CLIENT_ID,
    response_type: 'code',
    platform_id:   'mp',
    redirect_uri:  process.env.MP_REDIRECT_URI,
    state:         professionalId
  })
  return `${MP_AUTH_URL}?${params}`
}

async function handleCallback(code, professionalId) {
  const response = await axios.post(MP_TOKEN_URL, {
    client_secret: process.env.MP_CLIENT_SECRET,
    client_id:     process.env.MP_CLIENT_ID,
    grant_type:    'authorization_code',
    code,
    redirect_uri:  process.env.MP_REDIRECT_URI
  })

  const { access_token, refresh_token, user_id } = response.data

  await prisma.professional.update({
    where: { id: professionalId },
    data: {
      mpAccessToken:  access_token,
      mpRefreshToken: refresh_token,
      mpUserId:       String(user_id)
    }
  })
}

// ── Notificación de pago (semana 3) ───────────────────────────────────────
async function handlePaymentNotification(paymentId) {
  // TODO: implementar en semana 3
  console.log(`💰 Notificación de pago recibida: ${paymentId}`)
}

module.exports = { getAuthUrl, handleCallback, handlePaymentNotification }

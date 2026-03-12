/**
 * Enviar mensajes por WhatsApp Cloud API
 */
const axios = require('axios')

const BASE_URL = 'https://graph.facebook.com/v19.0'

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.WA_TOKEN}`,
    'Content-Type': 'application/json'
  }
}

// ── Mensaje de texto simple ────────────────────────────────────────────────
async function sendText(to, text) {
  const phoneId = process.env.WA_PHONE_ID
  const url     = `${BASE_URL}/${phoneId}/messages`

  await axios.post(url, {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { preview_url: false, body: text }
  }, { headers: getHeaders() })
}

// ── Lista de opciones (interactive list) ──────────────────────────────────
async function sendList(to, { header, body, footer, buttonLabel, sections }) {
  const phoneId = process.env.WA_PHONE_ID
  const url     = `${BASE_URL}/${phoneId}/messages`

  await axios.post(url, {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'interactive',
    interactive: {
      type: 'list',
      header: { type: 'text', text: header },
      body: { text: body },
      footer: footer ? { text: footer } : undefined,
      action: {
        button: buttonLabel,
        sections
      }
    }
  }, { headers: getHeaders() })
}

// ── Botones de respuesta rápida ────────────────────────────────────────────
async function sendButtons(to, { body, buttons }) {
  const phoneId = process.env.WA_PHONE_ID
  const url     = `${BASE_URL}/${phoneId}/messages`

  await axios.post(url, {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: body },
      action: {
        buttons: buttons.map(b => ({
          type: 'reply',
          reply: { id: b.id, title: b.title }
        }))
      }
    }
  }, { headers: getHeaders() })
}

module.exports = { sendText, sendList, sendButtons }

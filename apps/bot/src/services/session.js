/**
 * Manejo de sesiones de conversación con Redis
 * Fallback a Map en memoria si Redis no está disponible (desarrollo sin Redis)
 */
let client = null
const memoryStore = new Map()

function getRedis() {
  if (client) return client
  try {
    const Redis = require('ioredis')
    client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      lazyConnect: true,
      enableOfflineQueue: false,
      retryStrategy: () => null // no reintentar, usar fallback
    })
    client.on('error', () => {
      client = null // resetear para volver a intentar
    })
    return client
  } catch (_) {
    return null
  }
}

const TTL = 60 * 60 * 24 // 24 horas en segundos

async function getSession(phone) {
  const redis = getRedis()
  if (redis) {
    try {
      const data = await redis.get(`session:${phone}`)
      return data ? JSON.parse(data) : null
    } catch (_) {}
  }
  return memoryStore.get(phone) || null
}

async function setSession(phone, data) {
  const redis = getRedis()
  if (redis) {
    try {
      await redis.setex(`session:${phone}`, TTL, JSON.stringify(data))
      return
    } catch (_) {}
  }
  memoryStore.set(phone, data)
}

async function deleteSession(phone) {
  const redis = getRedis()
  if (redis) {
    try {
      await redis.del(`session:${phone}`)
      return
    } catch (_) {}
  }
  memoryStore.delete(phone)
}

module.exports = { getSession, setSession, deleteSession }

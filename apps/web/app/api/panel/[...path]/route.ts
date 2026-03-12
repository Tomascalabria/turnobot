/**
 * Proxy hacia el servidor Express de apps/bot
 * Agrega el header x-api-secret automáticamente
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'

const BOT_API_URL    = process.env.BOT_API_URL    || 'http://localhost:3001'
const BOT_API_SECRET = process.env.BOT_API_SECRET || ''

async function proxyRequest(req: NextRequest, { params }: { params: { path: string[] } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const path    = params.path.join('/')
  const url     = `${BOT_API_URL}/api/panel/${path}`
  const headers: Record<string, string> = {
    'Content-Type':  'application/json',
    'x-api-secret':  BOT_API_SECRET
  }

  let body: string | undefined
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await req.text()
  }

  const res = await fetch(url, {
    method:  req.method,
    headers,
    body
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export { proxyRequest as GET, proxyRequest as POST, proxyRequest as PUT, proxyRequest as DELETE }

import { NextResponse } from 'next/server'

export const revalidate = 3600

interface FuelPriceResponse {
  superPrice: number | null
  premiumPrice: number | null
  source: string
  sourceUrl: string
  fetchedAt: string
  error?: string
}

const SOURCE_URL = 'https://surtidores.com.ar/precios/'

/** Números en formato argentino: "." separa miles, "," separa decimales. */
function parseArgNumber(raw: string): number | null {
  const cleaned = raw.trim()
  const value = /,\d{1,2}$/.test(cleaned)
    ? Number(cleaned.replace(/\./g, '').replace(',', '.'))
    : Number(cleaned.replace(/\./g, ''))
  return Number.isFinite(value) ? value : null
}

function extractPrice(plainText: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = plainText.match(pattern)
    if (match?.[1]) {
      const value = parseArgNumber(match[1])
      // Rango razonable de precio de nafta en pesos argentinos por litro
      if (value !== null && value > 100 && value < 10000) return value
    }
  }
  return null
}

const AMOUNT = '\\$?\\s?(\\d{1,3}(?:\\.\\d{3})*(?:,\\d{1,2})?)'

export async function GET() {
  try {
    const res = await fetch(SOURCE_URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        Accept: 'text/html',
      },
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      throw new Error(`surtidores.com.ar respondió ${res.status}`)
    }

    const html = await res.text()
    const plainText = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')

    const superPrice = extractPrice(plainText, [
      new RegExp(`Nafta\\s*S[uú]per[^$\\d]{0,60}${AMOUNT}`, 'i'),
      new RegExp(`Nafta(?!\\s*(Premium|Infinia|Ultra))[^$\\d]{0,60}${AMOUNT}`, 'i'),
    ])
    const premiumPrice = extractPrice(plainText, [
      new RegExp(`(?:Infinia|Nafta\\s*Premium|Ultra)[^$\\d]{0,60}${AMOUNT}`, 'i'),
    ])

    if (superPrice === null && premiumPrice === null) {
      const payload: FuelPriceResponse = {
        superPrice: null,
        premiumPrice: null,
        source: 'surtidores.com.ar',
        sourceUrl: SOURCE_URL,
        fetchedAt: new Date().toISOString(),
        error: 'No se pudo interpretar el precio en la página',
      }
      return NextResponse.json(payload, { status: 502 })
    }

    const payload: FuelPriceResponse = {
      superPrice,
      premiumPrice,
      source: 'surtidores.com.ar',
      sourceUrl: SOURCE_URL,
      fetchedAt: new Date().toISOString(),
    }
    return NextResponse.json(payload)
  } catch {
    const payload: FuelPriceResponse = {
      superPrice: null,
      premiumPrice: null,
      source: 'surtidores.com.ar',
      sourceUrl: SOURCE_URL,
      fetchedAt: new Date().toISOString(),
      error: 'No se pudo obtener el precio de surtidores.com.ar',
    }
    return NextResponse.json(payload, { status: 502 })
  }
}

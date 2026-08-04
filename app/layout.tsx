import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TransBot – Auto, bondi o app',
  description: 'Comparador de costos de transporte: auto propio, colectivo, Uber y Cabify',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen text-gray-900">{children}</body>
    </html>
  )
}

import type { Metadata } from 'next'
import './globals.css'
import SessionProvider from './SessionProvider'

export const metadata: Metadata = {
  title: 'Turnobot – Panel de gestión',
  description: 'Bot de WhatsApp para gestión de turnos médicos'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}

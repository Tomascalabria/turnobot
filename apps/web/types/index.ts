// Tipos globales y configuración de planes

export type Plan = 'FREE' | 'STARTER' | 'PRO'

export interface PlanConfig {
  name: string
  price: number          // ARS/mes
  maxServices: number
  hasDeposit: boolean
  hasCalendar: boolean
  hasMercadoPago: boolean
  description: string
}

export const PLANS: Record<Plan, PlanConfig> = {
  FREE: {
    name: 'Gratuito',
    price: 0,
    maxServices: 1,
    hasDeposit: false,
    hasCalendar: false,
    hasMercadoPago: false,
    description: '1 servicio, sin cobro de seña, sin calendario'
  },
  STARTER: {
    name: 'Starter',
    price: 4990,
    maxServices: 5,
    hasDeposit: true,
    hasCalendar: true,
    hasMercadoPago: false,
    description: '5 servicios, seña MercadoPago, Google Calendar'
  },
  PRO: {
    name: 'Pro',
    price: 9990,
    maxServices: 999,
    hasDeposit: true,
    hasCalendar: true,
    hasMercadoPago: true,
    description: 'Servicios ilimitados, split payments, todo incluido'
  }
}

// Extender el tipo de sesión de NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      plan: Plan
    }
  }
  interface User {
    id: string
    plan: Plan
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    plan: Plan
  }
}

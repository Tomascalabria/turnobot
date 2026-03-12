'use client'
import Link     from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut }     from 'next-auth/react'

const navItems = [
  { href: '/dashboard',    label: 'Inicio',     icon: '🏠' },
  { href: '/services',     label: 'Servicios',  icon: '💼' },
  { href: '/appointments', label: 'Turnos',     icon: '📅' },
  { href: '/bot-config',   label: 'Bot Config', icon: '🤖' },
  { href: '/plan',         label: 'Mi Plan',    icon: '⭐' }
]

export default function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="w-56 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      <div className="p-6 border-b border-gray-100">
        <span className="text-lg font-bold text-gray-900">Turnobot 🤖</span>
      </div>

      <div className="flex-1 py-4">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
              pathname === item.href
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full text-sm text-gray-500 hover:text-red-500 py-2 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
}

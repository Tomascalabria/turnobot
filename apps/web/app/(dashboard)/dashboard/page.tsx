import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { prisma }           from '@/lib/prisma'
import { PLANS }            from '@/types'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const prof    = await prisma.professional.findUnique({
    where:   { id: session!.user.id },
    include: { services: true, _count: { select: { appointments: true } } }
  })

  if (!prof) return null

  const plan       = PLANS[prof.plan]
  const calOk      = !!prof.googleCalendarId
  const mpOk       = !!prof.mpAccessToken
  const botApiUrl  = process.env.BOT_API_URL || 'http://localhost:3001'

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Hola, {prof.name} 👋</h1>
      <p className="text-gray-500 mb-8">Plan actual: <span className="font-semibold">{plan.name}</span></p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Turnos totales"  value={prof._count.appointments} />
        <StatCard label="Servicios"       value={prof.services.length} />
        <StatCard label="Google Calendar" value={calOk ? '✅' : '❌'} />
        <StatCard label="MercadoPago"     value={mpOk  ? '✅' : '❌'} />
      </div>

      {/* Integraciones */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Integraciones</h2>
        <div className="space-y-3">
          <IntegrationRow
            label="Google Calendar"
            connected={calOk}
            connectUrl={`${botApiUrl}/api/calendar/connect?professionalId=${prof.id}`}
            disconnectUrl={`/api/panel/calendar/disconnect`}
            plan={plan}
            required="hasCalendar"
          />
          <IntegrationRow
            label="MercadoPago"
            connected={mpOk}
            connectUrl={`${botApiUrl}/api/mercadopago/connect?professionalId=${prof.id}`}
            disconnectUrl={`/api/panel/mp/disconnect`}
            plan={plan}
            required="hasMercadoPago"
          />
        </div>
      </div>

      {/* Accesos rápidos semana 4 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: '/services',     label: 'Servicios',     icon: '💼' },
          { href: '/appointments', label: 'Turnos',         icon: '📅' },
          { href: '/bot-config',   label: 'Config Bot',     icon: '🤖' },
          { href: '/plan',         label: 'Mi Plan',        icon: '⭐' }
        ].map(item => (
          <a key={item.href} href={item.href}
            className="bg-white rounded-xl shadow-sm p-5 text-center hover:shadow-md transition-shadow">
            <div className="text-3xl mb-2">{item.icon}</div>
            <p className="text-sm font-medium text-gray-700">{item.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">Semana 4</p>
          </a>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}

function IntegrationRow({
  label, connected, connectUrl, plan, required
}: {
  label: string; connected: boolean; connectUrl: string;
  disconnectUrl: string; plan: any; required: string
}) {
  const available = plan[required as keyof typeof plan]
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <span className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300'}`} />
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      {!available ? (
        <a href="/plan" className="text-xs text-blue-600 hover:underline">Actualizar plan</a>
      ) : connected ? (
        <span className="text-xs text-green-600 font-medium">Conectado</span>
      ) : (
        <a href={connectUrl} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700">
          Conectar
        </a>
      )}
    </div>
  )
}

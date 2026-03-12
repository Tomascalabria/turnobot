'use client'

interface Professional {
  id: string
  name: string
  email: string
  plan: string
  createdAt: string
  _count: { appointments: number; services: number }
}

interface Props {
  professionals: Professional[]
  totalAppointments: number
}

export default function AdminDashboardClient({ professionals, totalAppointments }: Props) {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-2">Panel Admin 🛡️</h1>
      <p className="text-gray-400 mb-8">Turnobot – vista interna</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Profesionales</p>
          <p className="text-3xl font-bold mt-1">{professionals.length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Turnos totales</p>
          <p className="text-3xl font-bold mt-1">{totalAppointments}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Planes PRO</p>
          <p className="text-3xl font-bold mt-1">
            {professionals.filter(p => p.plan === 'PRO').length}
          </p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-4 text-gray-400 font-medium">Profesional</th>
              <th className="text-left p-4 text-gray-400 font-medium">Plan</th>
              <th className="text-left p-4 text-gray-400 font-medium">Turnos</th>
              <th className="text-left p-4 text-gray-400 font-medium">Servicios</th>
              <th className="text-left p-4 text-gray-400 font-medium">Alta</th>
            </tr>
          </thead>
          <tbody>
            {professionals.map(prof => (
              <tr key={prof.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                <td className="p-4">
                  <p className="font-medium">{prof.name}</p>
                  <p className="text-gray-400 text-xs">{prof.email}</p>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    prof.plan === 'PRO'     ? 'bg-purple-500/20 text-purple-300' :
                    prof.plan === 'STARTER' ? 'bg-blue-500/20 text-blue-300'    :
                                              'bg-gray-700 text-gray-400'
                  }`}>
                    {prof.plan}
                  </span>
                </td>
                <td className="p-4 text-gray-300">{prof._count.appointments}</td>
                <td className="p-4 text-gray-300">{prof._count.services}</td>
                <td className="p-4 text-gray-400 text-xs">
                  {new Date(prof.createdAt).toLocaleDateString('es-AR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

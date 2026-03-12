import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { redirect }         from 'next/navigation'
import { prisma }           from '@/lib/prisma'
import AdminDashboardClient from './AdminDashboardClient'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    redirect('/_admin/login')
  }

  const [professionals, totalAppointments] = await Promise.all([
    prisma.professional.findMany({
      include: { _count: { select: { appointments: true, services: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.appointment.count()
  ])

  return (
    <AdminDashboardClient
      professionals={JSON.parse(JSON.stringify(professionals))}
      totalAppointments={totalAppointments}
    />
  )
}

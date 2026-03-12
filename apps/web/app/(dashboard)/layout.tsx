import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { redirect }         from 'next/navigation'
import DashboardNav         from '@/components/DashboardNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardNav />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}

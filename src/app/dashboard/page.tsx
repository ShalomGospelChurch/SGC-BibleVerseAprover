export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getSession, getVersettiOggi, getStats } from '@/lib/actions'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [versetti, stats] = await Promise.all([
    getVersettiOggi(),
    getStats(),
  ])

  return (
    <DashboardClient
      user={session}
      initialVerses={versetti}
      stats={stats}
    />
  )
}
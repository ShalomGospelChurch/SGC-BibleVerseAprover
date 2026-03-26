import { redirect } from 'next/navigation'
import { getSession, getVersettiOggi, getLogs } from '@/lib/actions'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [versetti, logs] = await Promise.all([
    getVersettiOggi(),
    getLogs(),
  ])

  return (
    <DashboardClient
      user={session}
      initialVerses={versetti}
      initialLogs={logs}
    />
  )
}
import { redirect } from 'next/navigation'
import { getSession, getVersettiOggi } from '@/lib/actions'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const versetti = await getVersettiOggi()

  return (
    <DashboardClient
      user={session}
      initialVerses={versetti}
    />
  )
}
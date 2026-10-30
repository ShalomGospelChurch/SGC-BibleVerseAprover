export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getSession, getVersettiUsati } from '@/lib/actions'
import { getBibleStats } from '@/lib/bible-stats'
import VersettiUsatiClient from './versetti-usati-client'

export default async function VersettiUsatiPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['SuperAdmin', 'Admin'].includes(session.ruolo)) redirect('/dashboard')

  const [versetti, stats] = await Promise.all([getVersettiUsati(), getBibleStats()])
  return <VersettiUsatiClient user={session} initialVersetti={versetti} stats={stats} />
}
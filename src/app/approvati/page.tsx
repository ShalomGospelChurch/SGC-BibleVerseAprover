export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getSession, getVersettiApprovati } from '@/lib/actions'
import ApprovatiClient from './approvati-client'

export default async function ApprovatiPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const approvati = await getVersettiApprovati()

  return <ApprovatiClient user={session} initialApprovati={approvati} />
}
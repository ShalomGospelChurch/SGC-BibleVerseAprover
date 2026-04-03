export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/actions'
import UtentiClient from './utenti-client'

export default async function UtentiPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['SuperAdmin', 'Admin'].includes(session.ruolo)) redirect('/dashboard')

  return <UtentiClient user={session} />
}
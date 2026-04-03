import { redirect } from 'next/navigation'
import { getSession, getLogs } from '@/lib/actions'
import LogClient from './log-client'

export default async function LogPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['SuperAdmin', 'Admin'].includes(session.ruolo)) redirect('/dashboard')

  const logs = await getLogs()
  return <LogClient user={session} initialLogs={logs} />
}
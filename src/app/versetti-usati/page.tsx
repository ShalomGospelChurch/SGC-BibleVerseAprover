import { redirect } from 'next/navigation'
import { getSession, getVersettiUsati } from '@/lib/actions'
import VersettiUsatiClient from './versetti-usati-client'

export default async function VersettiUsatiPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['SuperAdmin', 'Admin'].includes(session.ruolo)) redirect('/dashboard')

  const versetti = await getVersettiUsati()
  return <VersettiUsatiClient user={session} initialVersetti={versetti} />
}
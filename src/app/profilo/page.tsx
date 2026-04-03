export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/actions'
import ProfiloClient from './profilo-client'

export default async function ProfiloPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  return <ProfiloClient user={session} />
}
'use server'

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('sgc-session')
  if (!session) return null
  try {
    return JSON.parse(session.value)
  } catch {
    return null
  }
}

export async function getVersettiOggi() {
  const { data, error } = await supabase
    .from('versetti')
    .select('*')
    .eq('stato', 'pending')
    .order('created_at', { ascending: true })
    .limit(7)

  if (error) return []
  return data
}

export async function getLogs() {
  const { data, error } = await supabase
    .from('log_azioni')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return []
  return data
}
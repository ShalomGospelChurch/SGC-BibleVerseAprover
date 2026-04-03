import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json()
    const cookieStore = await cookies()
    const session = cookieStore.get('sgc-session')
    if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    const { id } = JSON.parse(session.value)

    await supabase.from('push_subscriptions').upsert({
      utente_id: id,
      subscription,
    }, { onConflict: 'utente_id' })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}
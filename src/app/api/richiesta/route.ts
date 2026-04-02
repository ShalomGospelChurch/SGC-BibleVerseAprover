import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { tipo, valore_nuovo } = await request.json()
    const cookieStore = await cookies()
    const session = cookieStore.get('sgc-session')
    if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    const { id } = JSON.parse(session.value)

    await supabase.from('richieste_profilo').insert({
      utente_id: id,
      tipo,
      valore_nuovo,
      stato: 'pending'
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}
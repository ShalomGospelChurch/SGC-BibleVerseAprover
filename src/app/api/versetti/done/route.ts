import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { versetto_id, riferimento_ita, utente, ruolo } = await request.json()

    await supabase
      .from('versetti')
      .update({ immagine_stato: 'done' })
      .eq('id', versetto_id)

    await supabase.from('log_azioni').insert({
      versetto_id,
      riferimento: riferimento_ita,
      azione: 'immagine_completata',
      utente,
      ruolo,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}
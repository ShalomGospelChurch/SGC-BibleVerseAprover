import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { id, utente_id, tipo, valore_nuovo } = await request.json()

    // Aggiorna utente
    await supabase.from('utenti').update({ [tipo]: valore_nuovo }).eq('id', utente_id)

    // Aggiorna stato richiesta
    await supabase.from('richieste_profilo').update({ stato: 'approved' }).eq('id', id)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}
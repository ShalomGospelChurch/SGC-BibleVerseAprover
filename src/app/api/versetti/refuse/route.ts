import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { versetto_id, riferimento_ita, utente, ruolo } = await request.json()

    // Elimina definitivamente dal DB
    await supabase
      .from('versetti')
      .delete()
      .eq('id', versetto_id)

    // Log
    await supabase.from('log_azioni').insert([
      { versetto_id, riferimento: riferimento_ita, azione: 'refused', utente, ruolo },
    ])

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}
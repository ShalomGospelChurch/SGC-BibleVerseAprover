import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
export async function POST(request: NextRequest) {
  try {
    const { versetto_id, riferimento_ita, utente, ruolo, row_number } = await request.json()

    await supabase
      .from('versetti')
      .update({ stato: 'approved', approvato_da: utente, updated_at: new Date().toISOString() })
      .eq('id', versetto_id)

    await supabase.from('log_azioni').insert({
      versetto_id, riferimento: riferimento_ita,
      azione: 'approved', utente, ruolo,
    })

    try {
      await fetch(process.env.WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versetto_id, riferimento_ita, stato: 'approved', approvato_da: utente, ruolo, row_number }),
      })
    } catch { }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}
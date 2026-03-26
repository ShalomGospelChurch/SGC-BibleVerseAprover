import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { versetto_id, riferimento_ita, utente, ruolo, row_number } = await request.json()

    await supabase
      .from('versetti')
      .update({ stato: 'refused', updated_at: new Date().toISOString() })
      .eq('id', versetto_id)

    await supabase.from('log_azioni').insert([
      { versetto_id, riferimento: riferimento_ita, azione: 'refused', utente, ruolo },
      { versetto_id, riferimento: riferimento_ita, azione: 'regenerated', utente: 'Gemini AI', ruolo: 'Sistema' },
    ])

    try {
      await fetch(process.env.WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versetto_id, riferimento_ita, stato: 'refused', row_number, approvato_da: utente, ruolo }),
      })
    } catch { }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}
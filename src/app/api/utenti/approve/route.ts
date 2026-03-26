import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { id, ruolo } = await request.json()

    const { error } = await supabase
      .from('utenti')
      .update({ stato: 'approved', attivo: true, ruolo })
      .eq('id', id)

    if (error) return NextResponse.json({ error: 'Errore' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}
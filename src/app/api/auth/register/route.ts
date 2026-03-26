import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { nome, username, password, ruolo } = await request.json()

    // Controlla se username esiste già
    const { data: existing } = await supabase
      .from('utenti')
      .select('id')
      .eq('username', username)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Username già in uso' },
        { status: 400 }
      )
    }

    // Crea utente con stato pending
    const avatar = nome.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

    const { error } = await supabase
      .from('utenti')
      .insert({
        nome,
        username,
        password_hash: password,
        ruolo,
        avatar,
        stato: 'pending',
        attivo: false,
      })

    if (error) {
      return NextResponse.json({ error: 'Errore durante la registrazione' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}
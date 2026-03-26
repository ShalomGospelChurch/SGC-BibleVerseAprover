import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    const { data, error } = await supabase
      .from('utenti')
      .select('*')
      .eq('username', username)
      .eq('password_hash', password)
      .eq('stato', 'approved')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Credenziali non valide o account non ancora approvato' },
        { status: 401 }
      )
    }

    const session = JSON.stringify({
      id: data.id,
      username: data.username,
      nome: data.nome,
      ruolo: data.ruolo,
      avatar: data.avatar,
    })

    const response = NextResponse.json({ success: true })
    response.cookies.set('sgc-session', session, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
    })

    return response
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}
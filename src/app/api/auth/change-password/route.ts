import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json()
    
    const cookieStore = await cookies()
    const session = cookieStore.get('sgc-session')
    if (!session) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    
    const { id } = JSON.parse(session.value)
    
    const { data: user } = await supabase
      .from('utenti')
      .select('password_hash')
      .eq('id', id)
      .single()
    
    if (!user) return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })
    
    const ok = await bcrypt.compare(currentPassword, user.password_hash)
    if (!ok) return NextResponse.json({ error: 'Password attuale errata' }, { status: 401 })
    
    const hashed = await bcrypt.hash(newPassword, 10)
    await supabase.from('utenti').update({ password_hash: hashed }).eq('id', id)
    
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}
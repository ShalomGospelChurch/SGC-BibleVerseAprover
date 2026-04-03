import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()
    await supabase.from('richieste_profilo').update({ stato: 'rejected' }).eq('id', id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}
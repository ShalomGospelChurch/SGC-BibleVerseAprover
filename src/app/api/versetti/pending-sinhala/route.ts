import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  const { data } = await supabase
    .from('versetti')
    .select('riferimento_sin, testo_sin')
    .eq('stato', 'pending')
    .order('created_at', { ascending: true })
    .limit(7)

  const text = data?.map(v => `*${v.riferimento_sin}*\n${v.testo_sin}`).join('\n\n') || ''
  return NextResponse.json({ text })
}
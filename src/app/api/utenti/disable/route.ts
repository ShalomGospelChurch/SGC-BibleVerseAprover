import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  const { id } = await request.json()
  await supabase.from('utenti').update({ stato: 'disabled' }).eq('id', id)
  return NextResponse.json({ success: true })
}
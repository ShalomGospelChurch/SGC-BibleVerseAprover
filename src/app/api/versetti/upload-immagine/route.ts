import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const versetto_id = formData.get('versetto_id') as string
    const riferimento_ita = formData.get('riferimento_ita') as string
    const utente = formData.get('utente') as string
    const ruolo = formData.get('ruolo') as string

    const fileName = `${versetto_id}_${Date.now()}.png`

    // Upload su Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('immagini-versetti')
      .upload(fileName, file, { contentType: 'image/png', upsert: true })

    if (uploadError) throw uploadError

    // Ottieni URL pubblico
    const { data: urlData } = supabase.storage
      .from('immagini-versetti')
      .getPublicUrl(fileName)

    // Aggiorna versetto
    await supabase
      .from('versetti')
      .update({ immagine_url: urlData.publicUrl, immagine_stato: 'done' })
      .eq('id', versetto_id)

    // Log
    await supabase.from('log_azioni').insert({
      versetto_id: Number(versetto_id),
      riferimento: riferimento_ita,
      azione: 'immagine_generata',
      utente,
      ruolo,
    })

    return NextResponse.json({ success: true, url: urlData.publicUrl })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Errore upload' }, { status: 500 })
  }
}
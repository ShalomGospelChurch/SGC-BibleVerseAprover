import {  NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST() {
  try {
    // 1. Leggi blacklist da versetti_usati
    const { data: usati } = await supabase
      .from('versetti_usati')
      .select('riferimento_ita')

    const blacklist = usati?.map(v => v.riferimento_ita).join(', ') || ''

    // 2. Chiama Gemini
    const prompt = `Sei un esperto biblico. Questi sono i versetti già usati: ${blacklist}. 
Proponimi 21 nuovi versetti di promesse, benedizioni e incoraggiamento NON presenti in questa lista. 
IMPORTANTE: per versetti lunghi puoi usare solo una parte significativa (es. Isaia 41:10a oppure Giovanni 3:16b) fino alla virgola o al punto più significativo — indica sempre la parte con la lettera a o b dopo il numero. 
Versione italiana Nuova Riveduta. Versione Sinhala Old Version. 
Rispondi SOLO con JSON valido senza testo extra nel formato: 
[{"riferimento_ita":"...","testo_ita":"...","riferimento_sin":"...","testo_sin":"...","tema":"..."}]`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    )

    const geminiData = await response.json()
    const rawText = geminiData.candidates[0].content.parts[0].text
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
    const versetti = JSON.parse(cleaned)
    type VersettoGemini = {
        riferimento_ita: string
        testo_ita: string
        riferimento_sin: string
        testo_sin: string
        tema: string
    }

    // 3. Salva in Supabase come pending
    const oggi = new Date().toISOString().split('T')[0]
    const rows = versetti.map((v: VersettoGemini, i: number) => ({
      data: oggi,
      numero: i + 1,
      riferimento_ita: v.riferimento_ita,
      testo_ita: v.testo_ita,
      riferimento_sin: v.riferimento_sin,
      testo_sin: v.testo_sin,
      tema: v.tema,
      stato: 'pending',
    }))

    const { error } = await supabase.from('versetti').insert(rows)
    if (error) throw error

    return NextResponse.json({ success: true, count: rows.length })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Errore generazione' }, { status: 500 })
  }
}
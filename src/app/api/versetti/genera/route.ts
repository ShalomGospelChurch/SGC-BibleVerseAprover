import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const BOOK_MAP: Record<string, number> = {
  'Genesi': 1, 'Esodo': 2, 'Levitico': 3, 'Numeri': 4, 'Deuteronomio': 5,
  'Giosuè': 6, 'Giudici': 7, 'Rut': 8, '1 Samuele': 9, '2 Samuele': 10,
  '1 Re': 11, '2 Re': 12, '1 Cronache': 13, '2 Cronache': 14, 'Esdra': 15,
  'Neemia': 16, 'Ester': 17, 'Giobbe': 18, 'Salmi': 19, 'Proverbi': 20,
  'Ecclesiaste': 21, 'Cantico': 22, 'Isaia': 23, 'Geremia': 24,
  'Lamentazioni': 25, 'Ezechiele': 26, 'Daniele': 27, 'Osea': 28,
  'Gioele': 29, 'Amos': 30, 'Abdia': 31, 'Giona': 32, 'Michea': 33,
  'Naum': 34, 'Abacuc': 35, 'Sofonia': 36, 'Aggeo': 37, 'Zaccaria': 38,
  'Malachia': 39,
  'Matteo': 40, 'Marco': 41, 'Luca': 42, 'Giovanni': 43, 'Atti': 44,
  'Romani': 45, '1 Corinzi': 46, '2 Corinzi': 47, 'Galati': 48,
  'Efesini': 49, 'Filippesi': 50, 'Colossesi': 51,
  '1 Tessalonicesi': 52, '2 Tessalonicesi': 53,
  '1 Timoteo': 54, '2 Timoteo': 55, 'Tito': 56, 'Filemone': 57,
  'Ebrei': 58, 'Giacomo': 59, '1 Pietro': 60, '2 Pietro': 61,
  '1 Giovanni': 62, '2 Giovanni': 63, '3 Giovanni': 64, 'Giuda': 65,
  'Apocalisse': 66,
}

let xmlCache: string | null = null

function getSinhalaVerse(riferimento: string): string | null {
  try {
    if (!xmlCache) {
      xmlCache = readFileSync(join(process.cwd(), 'public', 'SinhalaSROVBible.xml')).toString('utf-8')
    }
    const clean = riferimento.trim().replace(/[ab]$/, '')
    const match = clean.match(/^(.+?)\s+(\d+):(\d+)/)
    if (!match) return null
    const bookNum = BOOK_MAP[match[1].trim()]
    if (!bookNum) return null
    const chapter = parseInt(match[2])
    const verse = parseInt(match[3])

    const bookMatch = xmlCache.match(new RegExp(`<book number="${bookNum}">[\\s\\S]*?</book>`))
    if (!bookMatch) return null
    const chapterMatch = bookMatch[0].match(new RegExp(`<chapter number="${chapter}">[\\s\\S]*?</chapter>`))
    if (!chapterMatch) return null
    const verseMatch = chapterMatch[0].match(new RegExp(`<verse number="${verse}">([\\s\\S]*?)</verse>`))
    if (!verseMatch) return null
    return verseMatch[1].trim()
  } catch { return null }
}

export async function POST() {
  try {
    // 1. Leggi blacklist da versetti_usati
    const { data: usati } = await supabase
      .from('versetti_usati')
      .select('riferimento_ita')

    const blacklist = usati?.map(v => v.riferimento_ita).join(', ') || ''

    // 2. Chiama Gemini
    const prompt = `
      Sei un esperto biblico. Questi sono i versetti già usati: ${blacklist}. 
      Proponimi 21 nuovi versetti di promesse, benedizioni e incoraggiamento NON presenti in questa lista. 
      IMPORTANTE: per versetti lunghi puoi usare solo una parte significativa (es. Isaia 41:10a oppure Giovanni 3:16b) fino alla virgola o al punto più significativo — indica sempre la parte con la lettera a o b dopo il numero. 
      Versione italiana Nuova Riveduta. Versione Sinhala Union Old Version 2007. 
      Rispondi SOLO con JSON valido senza testo extra nel formato: 
      [{"riferimento_ita":"...","testo_ita":"...","riferimento_sin":"...","testo_sin":"...","tema":"..."}]
    `

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

    // 3. Sostituisci testo_sin con quello ufficiale dal XML
    const oggi = new Date().toISOString().split('T')[0]
    const rowsWithOfficialSin = versetti.map((v: VersettoGemini, i: number) => {
      const sinFromXml = getSinhalaVerse(v.riferimento_ita)
      return {
        data: oggi,
        numero: i + 1,
        riferimento_ita: v.riferimento_ita,
        testo_ita: v.testo_ita,
        riferimento_sin: v.riferimento_sin,
        testo_sin: sinFromXml || v.testo_sin,
        tema: v.tema,
        stato: 'pending',
      }
    })

    const { error } = await supabase.from('versetti').insert(rowsWithOfficialSin)
    if (error) throw error

    return NextResponse.json({ success: true, count: rowsWithOfficialSin.length })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Errore generazione' }, { status: 500 })
  }
}
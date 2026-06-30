import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

// Mappa riferimento italiano → numero libro XML
const BOOK_MAP: Record<string, number> = {
  // Antico Testamento
  'Genesi': 1, 'Esodo': 2, 'Levitico': 3, 'Numeri': 4, 'Deuteronomio': 5,
  'Giosuè': 6, 'Giudici': 7, 'Rut': 8, '1 Samuele': 9, '2 Samuele': 10,
  '1 Re': 11, '2 Re': 12, '1 Cronache': 13, '2 Cronache': 14, 'Esdra': 15,
  'Neemia': 16, 'Ester': 17, 'Giobbe': 18, 'Salmi': 19, 'Proverbi': 20,
  'Ecclesiaste': 21, 'Cantico': 22, 'Isaia': 23, 'Geremia': 24,
  'Lamentazioni': 25, 'Ezechiele': 26, 'Daniele': 27, 'Osea': 28,
  'Gioele': 29, 'Amos': 30, 'Abdia': 31, 'Giona': 32, 'Michea': 33,
  'Naum': 34, 'Abacuc': 35, 'Sofonia': 36, 'Aggeo': 37, 'Zaccaria': 38,
  'Malachia': 39,
  // Nuovo Testamento
  'Matteo': 40, 'Marco': 41, 'Luca': 42, 'Giovanni': 43, 'Atti': 44,
  'Romani': 45, '1 Corinzi': 46, '2 Corinzi': 47, 'Galati': 48,
  'Efesini': 49, 'Filippesi': 50, 'Colossesi': 51,
  '1 Tessalonicesi': 52, '2 Tessalonicesi': 53,
  '1 Timoteo': 54, '2 Timoteo': 55, 'Tito': 56, 'Filemone': 57,
  'Ebrei': 58, 'Giacomo': 59, '1 Pietro': 60, '2 Pietro': 61,
  '1 Giovanni': 62, '2 Giovanni': 63, '3 Giovanni': 64, 'Giuda': 65,
  'Apocalisse': 66,
}

function parseReference(riferimento: string): { bookNum: number, chapter: number, verse: number } | null {
  // Gestisce formati come "Matteo 6:32", "Matteo 6:32b", "1 Corinzi 13:4"
  const clean = riferimento.trim().replace(/[ab]$/, '')
  
  // Cerca il pattern "Nome Capitolo:Versetto"
  const match = clean.match(/^(.+?)\s+(\d+):(\d+)/)
  if (!match) return null

  const bookName = match[1].trim()
  const chapter = parseInt(match[2])
  const verse = parseInt(match[3])

  const bookNum = BOOK_MAP[bookName]
  if (!bookNum) return null

  return { bookNum, chapter, verse }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const riferimento = searchParams.get('ref')

  if (!riferimento) {
    return NextResponse.json({ error: 'ref parameter required' }, { status: 400 })
  }

  const parsed = parseReference(riferimento)
  if (!parsed) {
    return NextResponse.json({ error: 'Riferimento non riconosciuto' }, { status: 400 })
  }

  try {
    const xmlPath = join(process.cwd(), 'public', 'SinhalaOVBible.xml')
    const xml = readFileSync(xmlPath).toString('utf-8')

    // Regex per trovare il versetto corretto
    const bookRegex = new RegExp(
      `<book number="${parsed.bookNum}">[\\s\\S]*?</book>`
    )
    const bookMatch = xml.match(bookRegex)
    if (!bookMatch) {
      return NextResponse.json({ error: 'Libro non trovato' }, { status: 404 })
    }

    const chapterRegex = new RegExp(
      `<chapter number="${parsed.chapter}">[\\s\\S]*?</chapter>`
    )
    const chapterMatch = bookMatch[0].match(chapterRegex)
    if (!chapterMatch) {
      return NextResponse.json({ error: 'Capitolo non trovato' }, { status: 404 })
    }

    const verseRegex = new RegExp(
      `<verse number="${parsed.verse}">([\\s\\S]*?)</verse>`
    )
    const verseMatch = chapterMatch[0].match(verseRegex)
    if (!verseMatch) {
      return NextResponse.json({ error: 'Versetto non trovato' }, { status: 404 })
    }

    return new Response(
  JSON.stringify({ riferimento, testo_sin: verseMatch[1].trim() }),
  { 
    headers: { 
      'Content-Type': 'application/json; charset=utf-8' 
    } 
  }
)

  } catch (error) {
    console.error('Bible XML error:', error)
    return NextResponse.json({ error: 'Errore lettura file' }, { status: 500 })
  }
}
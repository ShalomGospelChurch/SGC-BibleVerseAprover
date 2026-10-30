// Calcolo statistiche di copertura biblica (solo server: legge l'XML da /public)
import { readFileSync } from 'fs'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'
import { BOOKS, type BibleStats, type BookStat } from './bible-books'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ---- Struttura della Bibbia (versetti per capitolo), letta una volta e messa in cache ----
let structure: Map<number, Map<number, number>> | null = null

function loadStructure() {
  if (structure) return structure
  const xml = readFileSync(join(process.cwd(), 'public', 'SinhalaOVBible.xml'), 'utf-8')
  const map = new Map<number, Map<number, number>>()
  const re = /<(book|chapter|verse) number="(\d+)"/g
  let book = 0
  let chapter = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(xml))) {
    const n = parseInt(m[2], 10)
    if (m[1] === 'book') {
      book = n
      map.set(book, new Map())
    } else if (m[1] === 'chapter') {
      chapter = n
      map.get(book)!.set(chapter, 0)
    } else {
      const ch = map.get(book)!
      ch.set(chapter, (ch.get(chapter) || 0) + 1)
    }
  }
  structure = map
  return map
}

// ---- Parsing dei riferimenti ("Giovanni 3:16", "Isaia 41:10a", "Salmi 23:1-3") ----
const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim()

const BOOK_LOOKUP = new Map<string, number>()
BOOKS.forEach(b => BOOK_LOOKUP.set(norm(b.name), b.num))
const ALIASES: Record<string, number> = {
  'salmo': 19, 'cantico dei cantici': 22, 'qoelet': 21, 'atti degli apostoli': 44,
  'apocalisse di giovanni': 66, 'lamentazioni di geremia': 25,
}
Object.entries(ALIASES).forEach(([k, v]) => v && BOOK_LOOKUP.set(k, v))

function findBook(raw: string): number | null {
  let name = norm(raw)
  name = name.replace(/^(i{1,3})\s+/, (_, r: string) => `${r.length} `) // I/II/III → 1/2/3
  name = name.replace(/^(\d)\s*[°ºa]?\s*/, '$1 ')
  return BOOK_LOOKUP.get(name) ?? null
}

function parseRef(ref: string): { book: number; chapter: number; verses: number[] } | null {
  const m = ref.trim().match(/^(.+?)\s+(\d+)\s*[:,.]\s*(\d+)[abc]?(?:\s*[-–]\s*(\d+)[abc]?)?/i)
  if (!m) return null
  const book = findBook(m[1])
  if (!book) return null
  const chapter = parseInt(m[2], 10)
  const start = parseInt(m[3], 10)
  const end = m[4] ? Math.max(start, parseInt(m[4], 10)) : start
  const verses: number[] = []
  for (let v = start; v <= end && v - start < 200; v++) verses.push(v)
  return { book, chapter, verses }
}

// ---- Lettura paginata di versetti_usati (Supabase limita a 1000 righe per richiesta) ----
async function fetchUsati() {
  const rows: { riferimento_ita: string; created_at: string }[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('versetti_usati')
      .select('riferimento_ita, created_at')
      .order('id', { ascending: true })
      .range(from, from + 999)
    if (error || !data || data.length === 0) break
    rows.push(...data)
    if (data.length < 1000) break
  }
  return rows
}

export async function getBibleStats(): Promise<BibleStats> {
  const struct = loadStructure()
  const rows = await fetchUsati()

  const usedSet = new Set<string>() // "libro:capitolo:versetto" distinti
  const timesUsed = new Map<number, number>()
  const lastUsed = new Map<number, string>()
  const unparsed: string[] = []

  for (const r of rows) {
    const p = parseRef(r.riferimento_ita || '')
    const chapterMap = p ? struct.get(p.book) : null
    const maxVerse = p && chapterMap ? chapterMap.get(p.chapter) : undefined
    if (!p || !maxVerse) {
      unparsed.push(r.riferimento_ita)
      continue
    }
    timesUsed.set(p.book, (timesUsed.get(p.book) || 0) + 1)
    const prev = lastUsed.get(p.book)
    if (!prev || r.created_at > prev) lastUsed.set(p.book, r.created_at)
    for (const v of p.verses) {
      if (v <= maxVerse) usedSet.add(`${p.book}:${p.chapter}:${v}`)
    }
  }

  const usedPerChapter = new Map<string, number>()
  usedSet.forEach(key => {
    const [b, c] = key.split(':')
    const k = `${b}:${c}`
    usedPerChapter.set(k, (usedPerChapter.get(k) || 0) + 1)
  })

  const books: BookStat[] = BOOKS.map(b => {
    const chapters = Array.from(struct.get(b.num)?.entries() ?? [])
      .sort((x, y) => x[0] - y[0])
      .map(([chapter, total]) => ({ chapter, total, used: usedPerChapter.get(`${b.num}:${chapter}`) || 0 }))
    const total = chapters.reduce((s, c) => s + c.total, 0)
    const used = chapters.reduce((s, c) => s + c.used, 0)
    return {
      ...b, total, used,
      pct: total ? (used / total) * 100 : 0,
      timesUsed: timesUsed.get(b.num) || 0,
      lastUsed: lastUsed.get(b.num) || null,
      chapters,
    }
  })

  const sum = (t?: 'AT' | 'NT') =>
    books.filter(b => !t || b.testament === t).reduce(
      (a, b) => ({ total: a.total + b.total, used: a.used + b.used }), { total: 0, used: 0 })
  const all = sum()

  return {
    total: all.total,
    used: all.used,
    pct: all.total ? (all.used / all.total) * 100 : 0,
    testaments: { AT: sum('AT'), NT: sum('NT') },
    books,
    totalRefs: rows.length,
    unparsed,
  }
}

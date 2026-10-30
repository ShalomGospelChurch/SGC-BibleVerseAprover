// Costanti e tipi condivisi (sicuri da importare anche lato client)

export type Testament = 'AT' | 'NT'

export const BOOKS: { num: number; name: string; testament: Testament }[] = [
  'Genesi', 'Esodo', 'Levitico', 'Numeri', 'Deuteronomio', 'Giosuè', 'Giudici', 'Rut',
  '1 Samuele', '2 Samuele', '1 Re', '2 Re', '1 Cronache', '2 Cronache', 'Esdra', 'Neemia',
  'Ester', 'Giobbe', 'Salmi', 'Proverbi', 'Ecclesiaste', 'Cantico', 'Isaia', 'Geremia',
  'Lamentazioni', 'Ezechiele', 'Daniele', 'Osea', 'Gioele', 'Amos', 'Abdia', 'Giona',
  'Michea', 'Naum', 'Abacuc', 'Sofonia', 'Aggeo', 'Zaccaria', 'Malachia',
  'Matteo', 'Marco', 'Luca', 'Giovanni', 'Atti', 'Romani', '1 Corinzi', '2 Corinzi',
  'Galati', 'Efesini', 'Filippesi', 'Colossesi', '1 Tessalonicesi', '2 Tessalonicesi',
  '1 Timoteo', '2 Timoteo', 'Tito', 'Filemone', 'Ebrei', 'Giacomo', '1 Pietro', '2 Pietro',
  '1 Giovanni', '2 Giovanni', '3 Giovanni', 'Giuda', 'Apocalisse',
].map((name, i) => ({ num: i + 1, name, testament: (i < 39 ? 'AT' : 'NT') as Testament }))

export type ChapterStat = { chapter: number; total: number; used: number }

export type BookStat = {
  num: number
  name: string
  testament: Testament
  total: number        // versetti nel libro
  used: number         // versetti distinti usati
  pct: number          // 0-100
  timesUsed: number    // quante volte il libro compare in blacklist
  lastUsed: string | null
  chapters: ChapterStat[]
}

export type BibleStats = {
  total: number
  used: number
  pct: number
  testaments: Record<Testament, { total: number; used: number }>
  books: BookStat[]
  totalRefs: number     // righe in versetti_usati
  unparsed: string[]    // riferimenti non riconosciuti (non contati)
}

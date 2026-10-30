'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import type { BibleStats, BookStat } from '@/lib/bible-books'

const fmtPct = (p: number) => (p >= 10 || p === 0 ? p.toFixed(0) : p.toFixed(1)) + '%'
const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleDateString('it-IT') : '—')

export default function BibleProgress({ stats }: { stats: BibleStats }) {
  const [hover, setHover] = useState<BookStat | null>(null)
  const [selected, setSelected] = useState<BookStat | null>(null)
  const [open, setOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'used' | 'pct' | 'times'>('used')

  const ranking = [...stats.books]
    .filter(b => b.used > 0)
    .sort((a, b) =>
      sortBy === 'used' ? b.used - a.used : sortBy === 'pct' ? b.pct - a.pct : b.timesUsed - a.timesUsed)
  const neverUsed = stats.books.filter(b => b.used === 0)
  const maxRank = ranking.length
    ? sortBy === 'used' ? ranking[0].used : sortBy === 'pct' ? ranking[0].pct : ranking[0].timesUsed
    : 1

  const openBook = (b: BookStat | null) => { setSelected(b); setOpen(true) }

  return (
    <>
      <div className="rounded-2xl border border-white/5 bg-white/2 p-5 space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Copertura della Bibbia</p>
            <p className="text-3xl font-bold text-white tracking-tight">{fmtPct(stats.pct)}</p>
          </div>
          <p className="text-xs text-gray-500 text-right">
            {stats.used.toLocaleString('it-IT')} / {stats.total.toLocaleString('it-IT')} versetti<br />
            AT {stats.testaments.AT.used}/{stats.testaments.AT.total} · NT {stats.testaments.NT.used}/{stats.testaments.NT.total}
          </p>
        </div>

        {/* Barra: un segmento per libro, largo in proporzione ai suoi versetti, riempito per % usata */}
        <div className="flex gap-px h-5 rounded-md overflow-hidden cursor-pointer" onMouseLeave={() => setHover(null)}>
          {stats.books.map(b => (
            <button
              key={b.num}
              type="button"
              aria-label={`${b.name}: ${b.used} su ${b.total} versetti`}
              onMouseEnter={() => setHover(b)}
              onFocus={() => setHover(b)}
              onClick={() => openBook(b)}
              className="relative bg-white/6 hover:bg-white/12 transition-colors outline-none focus-visible:ring-1 focus-visible:ring-indigo-400"
              style={{ flexGrow: b.total, flexBasis: 0, minWidth: 2 }}
            >
              <span className="absolute inset-y-0 left-0 bg-indigo-500" style={{ width: `${Math.min(b.pct, 100)}%` }} />
            </button>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-gray-600 uppercase tracking-widest -mt-2">
          <span>Genesi</span><span>Antico Testamento · Nuovo Testamento</span><span>Apocalisse</span>
        </div>

        {/* Riga info: hover sul libro, altrimenti riepilogo */}
        <div className="min-h-10 text-sm">
          {hover ? (
            <p className="text-gray-300">
              <span className="font-semibold text-white">{hover.name}</span>{' '}
              — {hover.used}/{hover.total} versetti ({fmtPct(hover.pct)}) · usato {hover.timesUsed}×
              · ultimo: {fmtDate(hover.lastUsed)}
            </p>
          ) : (
            <p className="text-gray-600">
              Passa sopra un libro per i dettagli, clicca per le statistiche complete.
              {' '}<button type="button" onClick={() => openBook(null)} className="text-indigo-400 hover:text-indigo-300">Vedi classifica</button>
            </p>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-[#0f0f14] text-white ring-white/10">
          <DialogHeader>
            <DialogTitle className="text-lg">{selected ? selected.name : 'Statistiche per libro'}</DialogTitle>
            <DialogDescription className="text-gray-500">
              {selected
                ? `${selected.used}/${selected.total} versetti (${fmtPct(selected.pct)}) · usato ${selected.timesUsed}× · ultimo ${fmtDate(selected.lastUsed)}`
                : `${stats.used} versetti distinti su ${stats.total} · ${stats.totalRefs} riferimenti in blacklist`}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-2">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Capitoli</p>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(2.25rem,1fr))] gap-1">
                {selected.chapters.map(c => {
                  const p = c.total ? c.used / c.total : 0
                  return (
                    <div key={c.chapter} title={`Cap. ${c.chapter}: ${c.used}/${c.total}`}
                      className="h-9 rounded-md flex items-center justify-center text-[11px] font-mono text-white/80 border border-white/5"
                      style={{ background: p ? `rgba(99,102,241,${0.2 + 0.8 * p})` : 'rgba(255,255,255,0.04)' }}>
                      {c.chapter}
                    </div>
                  )
                })}
              </div>
              <button type="button" onClick={() => setSelected(null)} className="text-xs text-indigo-400 hover:text-indigo-300">
                ← Torna alla classifica
              </button>
            </div>
          )}

          {!selected && (
            <>
              <div className="flex gap-2 text-[11px]">
                {([['used', 'Versetti'], ['pct', '% copertura'], ['times', 'Volte usato']] as const).map(([k, l]) => (
                  <button key={k} type="button" onClick={() => setSortBy(k)}
                    className={`px-3 py-1 rounded-full border ${sortBy === k ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-white/10 text-gray-400 hover:text-white'}`}>
                    {l}
                  </button>
                ))}
              </div>

              <ol className="space-y-1.5">
                {ranking.slice(0, 15).map((b, i) => {
                  const v = sortBy === 'used' ? b.used : sortBy === 'pct' ? b.pct : b.timesUsed
                  return (
                    <li key={b.num}>
                      <button type="button" onClick={() => setSelected(b)} className="w-full text-left group">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-300 group-hover:text-white">{i + 1}. {b.name}</span>
                          <span className="text-gray-500 font-mono">
                            {b.used}/{b.total} · {fmtPct(b.pct)} · {b.timesUsed}×
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 mt-1">
                          <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(v / maxRank) * 100}%` }} />
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ol>

              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Mai usati ({neverUsed.length})</p>
                <p className="text-xs text-gray-500 leading-relaxed">{neverUsed.map(b => b.name).join(' · ') || '—'}</p>
              </div>

              {stats.unparsed.length > 0 && (
                <p className="text-[11px] text-amber-500/80">
                  {stats.unparsed.length} riferimenti non riconosciuti e non conteggiati: {stats.unparsed.slice(0, 5).join(', ')}
                  {stats.unparsed.length > 5 ? '…' : ''}
                </p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

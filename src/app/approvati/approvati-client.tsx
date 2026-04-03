'use client'

import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import type { Verse, Utente } from '@/lib/supabase'
import { BookOpen, Copy, Check } from 'lucide-react'
import Navbar from '@/components/Navbar'

export default function ApprovatiClient({
  user, initialApprovati
}: {
  user: Utente
  initialApprovati: Verse[]
}) {
  const [approvati, setApprovati] = useState<Verse[]>(initialApprovati)
  const [search, setSearch] = useState('')
  const [loadingId, setLoadingId] = useState<number | null>(null)

  const filtered = approvati.filter(v =>
    v.riferimento_ita.toLowerCase().includes(search.toLowerCase()) ||
    v.tema?.toLowerCase().includes(search.toLowerCase())
  )

  const copyPrompt = (verse: Verse) => {
    const prompt = `Generami un immagine 1080x1080 in alta definizione basato su questo versetto della bibbia senza rappresentazione di Gesù, persone o scritte nell'immagine: ${verse.testo_ita} (${verse.riferimento_ita})`
    navigator.clipboard.writeText(prompt)
    toast.success('Prompt copiato!')
  }

  const handleDone = async (verse: Verse) => {
    setLoadingId(verse.id)
    try {
      await fetch('/api/versetti/done', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          versetto_id: verse.id,
          riferimento_ita: verse.riferimento_ita,
          utente: user.nome,
          ruolo: user.ruolo,
        })
      })
      setApprovati(vs => vs.filter(v => v.id !== verse.id))
      toast.success('Versetto completato!')
    } catch {
      toast.error('Errore!')
    }
    setLoadingId(null)
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--bg-primary)'}}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#121212', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />

      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-600 shadow-lg shadow-indigo-600/20">
              <BookOpen size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">SGC BibleVerse</h1>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-0.5">Approvati</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/profilo" className="hidden sm:block text-right hover:opacity-80 transition-opacity">
              <p className="text-xs font-bold text-white">{user.nome}</p>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter">{user.ruolo}</p>
            </a>
          </div>
        </div>
      </header>

      <Navbar user={user} />

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="space-y-6">
          <div className="flex items-end justify-between px-2">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Approvati</h2>
              <p className="text-sm text-gray-500 font-medium">{filtered.length} versetti da completare</p>
            </div>
          </div>

          <input
            type="text"
            placeholder="Cerca per riferimento o tema..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500"
          />

          <div className="flex flex-col gap-4">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-sm">Nessun versetto da completare.</p>
              </div>
            ) : (
              filtered.map(v => (
                <div key={v.id} className="rounded-2xl p-5 border border-green-500/20 bg-green-500/5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-bold text-white">{v.riferimento_ita}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-500">{v.riferimento_sin}</p>
                        {v.tema && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-gray-700" />
                            <span className="text-[10px] uppercase tracking-widest text-indigo-400/80 font-bold">{v.tema}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => copyPrompt(v)}
                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors border border-indigo-500/20 px-3 py-1.5 rounded-lg hover:bg-indigo-500/10">
                        <Copy size={12} /> Prompt
                      </button>
                      <button onClick={() => handleDone(v)} disabled={loadingId === v.id}
                        className="flex items-center gap-1.5 text-xs font-bold text-green-400 hover:text-green-300 transition-colors border border-green-500/20 px-3 py-1.5 rounded-lg hover:bg-green-500/10 disabled:opacity-50">
                        {loadingId === v.id
                          ? <span className="w-3 h-3 border-2 border-green-500/30 border-t-green-400 rounded-full animate-spin" />
                          : <Check size={12} />
                        }
                        Fatto
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mb-2 leading-relaxed">{v.testo_ita}</p>
                  <p className="text-sm text-gray-400 leading-relaxed" style={{lineHeight: '1.6'}}>{v.testo_sin}</p>
                  <p className="text-[10px] text-gray-600 mt-3">Approvato da {v.approvato_da}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
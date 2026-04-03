'use client'

import { useState } from 'react'
import type { LogEntry, Utente } from '@/lib/supabase'
import { BookOpen } from 'lucide-react'
import Navbar from '@/components/Navbar'

export default function LogClient({ user, initialLogs }: { user: Utente; initialLogs: LogEntry[] }) {
  const [filter, setFilter] = useState<string>('tutti')

  const filtered = initialLogs.filter(log => {
    if (filter === 'tutti') return true
    return log.azione === filter
  })

  const azioneColor = (azione: string) => {
    switch (azione) {
      case 'approved': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'refused': return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'immagine_completata': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      default: return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    }
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--bg-primary)'}}>
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-600 shadow-lg shadow-indigo-600/20">
              <BookOpen size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">SGC BibleVerse</h1>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-0.5">Log</p>
            </div>
          </div>
          <a href="/profilo" className="hidden sm:block text-right hover:opacity-80 transition-opacity">
            <p className="text-xs font-bold text-white">{user.nome}</p>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter">{user.ruolo}</p>
          </a>
        </div>
      </header>

      <Navbar user={user} />

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="space-y-6">
          <div className="flex items-end justify-between px-2">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Log Azioni</h2>
              <p className="text-sm text-gray-500">{filtered.length} azioni</p>
            </div>
          </div>

          {/* Filtri */}
          <div className="flex gap-2 flex-wrap">
            {['tutti', 'approved', 'refused', 'immagine_completata'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg border transition-all ${
                  filter === f
                    ? 'bg-white text-black border-white'
                    : 'text-gray-500 border-white/10 hover:text-white hover:border-white/30'
                }`}>
                {f === 'tutti' ? 'Tutti' : f === 'approved' ? 'Approvati' : f === 'refused' ? 'Rifiutati' : 'Immagini'}
              </button>
            ))}
          </div>

          {/* Tabella */}
          <div className="rounded-2xl overflow-hidden border border-white/5 bg-white/2">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Timestamp', 'Riferimento', 'Azione', 'Utente'].map(h => (
                      <th key={h} className="text-[10px] text-gray-500 uppercase tracking-widest px-5 py-3 font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(log => (
                    <tr key={log.id} className="border-b border-white/2 hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3.5 text-xs font-mono text-gray-500">{new Date(log.created_at).toLocaleString('it-IT')}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-300 font-semibold">{log.riferimento}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${azioneColor(log.azione)}`}>
                          {log.azione.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400 font-medium">{log.utente}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
'use client'

import { useState } from 'react'
import type { Utente } from '@/lib/supabase'
import { BookOpen } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Header from '@/components/Header'

type VersettoUsato = { id: number; riferimento_ita: string; riferimento_sin: string | null; created_at: string }

export default function VersettiUsatiClient({ user, initialVersetti }: { user: Utente; initialVersetti: VersettoUsato[] }) {
  const [search, setSearch] = useState('')

  const filtered = initialVersetti.filter(v =>
    v.riferimento_ita.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen" style={{background: 'var(--bg-primary)'}}>
      <Header user={user} subtitle="Blacklist" />

      <Navbar user={user} />

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="space-y-6">
          <div className="px-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Versetti Usati</h2>
            <p className="text-sm text-gray-500">{filtered.length} versetti nella blacklist Gemini</p>
          </div>

          <input type="text" placeholder="Cerca versetto..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500" />

          <div className="rounded-2xl overflow-hidden overflow-x-auto border border-white/5 bg-white/2">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-[10px] text-gray-500 uppercase tracking-widest px-5 py-3 font-bold">Riferimento ITA</th>
                  <th className="text-[10px] text-gray-500 uppercase tracking-widest px-5 py-3 font-bold">Riferimento SIN</th>
                  <th className="text-[10px] text-gray-500 uppercase tracking-widest px-5 py-3 font-bold">Data</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id} className="border-b border-white/2 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-gray-300 font-semibold">{v.riferimento_ita}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{v.riferimento_sin || '—'}</td>
                    <td className="px-5 py-3.5 text-xs font-mono text-gray-600">{new Date(v.created_at).toLocaleDateString('it-IT')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
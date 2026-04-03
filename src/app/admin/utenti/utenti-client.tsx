'use client'

import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import type { Utente } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Header from '@/components/Header'

type Utente2 = { id: number; nome: string; username: string; ruolo: string; stato: string; avatar: string; created_at: string }
type Richiesta = { id: number; utente_id: number; utente_nome: string; tipo: string; valore_nuovo: string; stato: string; created_at: string }

export default function UtentiClient({ user }: { user: Utente }) {
  const [users, setUsers] = useState<Utente2[]>([])
  const [richieste, setRichieste] = useState<Richiesta[]>([])
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/utenti').then(r => r.json()),
      fetch('/api/admin/richieste').then(r => r.json()),
    ]).then(([u, r]) => {
      setUsers(u)
      setRichieste(r)
    }).finally(() => setLoading(false))
  }, [])

  const handleApproveUser = async (u: Utente2) => {
    setLoadingId(u.id)
    await fetch('/api/utenti/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id, ruolo: u.ruolo }) })
    setUsers(us => us.map(x => x.id === u.id ? { ...x, stato: 'approved' } : x))
    setLoadingId(null)
    toast.success('Utente approvato!')
  }

  const handleDisable = async (u: Utente2) => {
    if (!confirm(`Disabilitare ${u.nome}?`)) return
    setLoadingId(u.id)
    await fetch('/api/utenti/disable', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id }) })
    setUsers(us => us.map(x => x.id === u.id ? { ...x, stato: 'disabled' } : x))
    setLoadingId(null)
    toast.success('Utente disabilitato!')
  }

  const handleRoleChange = async (u: Utente2, ruolo: string) => {
    await fetch('/api/utenti/role', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id, ruolo }) })
    setUsers(us => us.map(x => x.id === u.id ? { ...x, ruolo } : x))
    toast.success('Ruolo aggiornato!')
  }

  const handleApproveRichiesta = async (r: Richiesta) => {
    setLoadingId(r.id)
    await fetch('/api/admin/richieste/approva', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: r.id, utente_id: r.utente_id, tipo: r.tipo, valore_nuovo: r.valore_nuovo }) })
    setRichieste(rs => rs.filter(x => x.id !== r.id))
    setLoadingId(null)
    toast.success('Richiesta approvata!')
  }

  const handleRejectRichiesta = async (r: Richiesta) => {
    setLoadingId(r.id)
    await fetch('/api/admin/richieste/rifiuta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: r.id }) })
    setRichieste(rs => rs.filter(x => x.id !== r.id))
    setLoadingId(null)
    toast.success('Richiesta rifiutata!')
  }

  const ruoli = ['SuperAdmin', 'Admin', 'Pastore', 'Grafico', 'Revisore']

  if (loading) return <div className="flex justify-center py-20"><span className="w-5 h-5 border-2 border-white/10 border-t-white rounded-full animate-spin"/></div>

  return (
    <div className="min-h-screen" style={{background: 'var(--bg-primary)'}}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#121212', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />

      <Header user={user} subtitle="Users" />

      <Navbar user={user} />

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-12">

        {/* SEZIONE UTENTI */}
        <section>
          <div className="px-2 mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Utenti</h2>
            <p className="text-sm text-gray-500">{users.length} utenti registrati</p>
          </div>
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="rounded-2xl border border-white/5 bg-white/2 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white bg-indigo-600 shrink-0">
                      {u.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{u.nome}</p>
                      <p className="text-[10px] text-gray-500">@{u.username}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${
                    u.stato === 'approved' ? 'text-green-400 border-green-500/20 bg-green-500/10' :
                    u.stato === 'disabled' ? 'text-red-400 border-red-500/20 bg-red-500/10' :
                    'text-yellow-400 border-yellow-500/20 bg-yellow-500/10'
                  }`}>{u.stato}</span>
                </div>
                <div className="flex items-center justify-between">
                  {user.ruolo === 'SuperAdmin' && u.id !== user.id ? (
                    <select value={u.ruolo} onChange={e => handleRoleChange(u, e.target.value)}
                      className="text-xs bg-white/5 border border-white/10 text-white rounded-lg px-2 py-1.5 outline-none">
                      {ruoli.map(r => <option key={r} value={r} className="bg-gray-900">{r}</option>)}
                    </select>
                  ) : (
                    <span className="text-xs text-gray-400">{u.ruolo}</span>
                  )}
                  <div className="flex gap-2">
                    {u.stato === 'pending' && (
                      <button onClick={() => handleApproveUser(u)} disabled={loadingId === u.id}
                        className="text-[10px] font-bold px-3 py-1.5 bg-white text-black rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50">
                        Approva
                      </button>
                    )}
                    {u.stato === 'approved' && u.id !== user.id && user.ruolo === 'SuperAdmin' && (
                      <button onClick={() => handleDisable(u)} disabled={loadingId === u.id}
                        className="text-[10px] font-bold px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-50">
                        Disabilita
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SEZIONE RICHIESTE */}
        <section>
          <div className="px-2 mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Richieste Profilo</h2>
            <p className="text-sm text-gray-500">{richieste.length} richieste in attesa</p>
          </div>
          {richieste.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 text-sm">Nessuna richiesta pendente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {richieste.map(r => (
                <div key={r.id} className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">{r.utente_nome}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Richiede modifica <span className="text-indigo-400 font-bold">{r.tipo}</span> → <span className="text-white">{r.valore_nuovo}</span>
                      </p>
                      <p className="text-[10px] text-gray-600 mt-1">{new Date(r.created_at).toLocaleString('it-IT')}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleRejectRichiesta(r)} disabled={loadingId === r.id}
                        className="text-[10px] font-bold px-3 py-1.5 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-all disabled:opacity-50">
                        Rifiuta
                      </button>
                      <button onClick={() => handleApproveRichiesta(r)} disabled={loadingId === r.id}
                        className="text-[10px] font-bold px-3 py-1.5 bg-white text-black rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50">
                        Approva
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  )
}
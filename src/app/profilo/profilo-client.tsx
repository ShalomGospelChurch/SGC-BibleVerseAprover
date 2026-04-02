'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import type { Utente } from '@/lib/supabase'
import { BookOpen, ArrowLeft } from 'lucide-react'

export default function ProfiloClient({ user }: { user: Utente }) {
  const router = useRouter()
  const [nome, setNome] = useState(user.nome)
  const [username, setUsername] = useState(user.username)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [ruolo, setRuolo] = useState(user.ruolo)
  const [loading, setLoading] = useState(false)

  const ruoli = ['Admin', 'Pastore', 'Grafico', 'Revisore']

    const handleSubmit = async (tipo: string, valore: string) => {
    setLoading(true)
    try {
        const endpoint = user.ruolo === 'SuperAdmin' 
        ? '/api/profilo/aggiorna' 
        : '/api/profilo/richiesta'
        
        const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, valore_nuovo: valore })
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        
        toast.success(user.ruolo === 'SuperAdmin' 
        ? 'Modificato!' 
        : 'Richiesta inviata! In attesa di approvazione.')
    } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Errore')
    }
    setLoading(false)
    }

  const handlePasswordSubmit = async () => {
    if (newPassword !== confirmPassword) { toast.error('Le password non coincidono'); return }
    if (newPassword.length < 6) { toast.error('Minimo 6 caratteri'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      toast.success('Password aggiornata!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Errore')
    }
    setLoading(false)
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
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-0.5">Profilo</p>
            </div>
          </div>
          <button onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-white uppercase transition-colors">
            <ArrowLeft size={14} /> Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10 space-y-6">

        {/* Avatar e info */}
        <div className="rounded-2xl border border-white/5 bg-white/2 p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white bg-indigo-600">
            {user.avatar}
          </div>
          <div>
            <p className="text-lg font-bold text-white">{user.nome}</p>
            <p className="text-xs text-gray-500">@{user.username}</p>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{user.ruolo}</span>
          </div>
        </div>

        {/* Modifica Nome */}
        <div className="rounded-2xl border border-white/5 bg-white/2 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white">Modifica Nome</h2>
          <input type="text" value={nome} onChange={e => setNome(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500" />
          <button onClick={() => handleSubmit('nome', nome)} disabled={loading || nome === user.nome}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50">
            Richiedi modifica nome
          </button>
        </div>

        {/* Modifica Username */}
        <div className="rounded-2xl border border-white/5 bg-white/2 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white">Modifica Username</h2>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500" />
          <button onClick={() => handleSubmit('username', username)} disabled={loading || username === user.username}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50">
            Richiedi modifica username
          </button>
        </div>

        {/* Cambia Password */}
        <div className="rounded-2xl border border-white/5 bg-white/2 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white">Cambia Password</h2>
          <input type="password" placeholder="Password attuale" value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500" />
          <input type="password" placeholder="Nuova password" value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500" />
          <input type="password" placeholder="Conferma nuova password" value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500" />
          <button onClick={handlePasswordSubmit} disabled={loading || !currentPassword || !newPassword || !confirmPassword}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50">
            Aggiorna Password
          </button>
        </div>

        {/* Richiesta cambio ruolo — non per SuperAdmin */}
        {user.ruolo !== 'SuperAdmin' && (
          <div className="rounded-2xl border border-white/5 bg-white/2 p-6 space-y-4">
            <h2 className="text-sm font-bold text-white">Richiedi Cambio Ruolo</h2>
            <select value={ruolo} onChange={e => setRuolo(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500">
              {ruoli.filter(r => r !== user.ruolo).map(r => (
                <option key={r} value={r} className="bg-gray-900">{r}</option>
              ))}
            </select>
            <button onClick={() => handleSubmit('ruolo', ruolo)} disabled={loading || ruolo === user.ruolo}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50">
              Richiedi cambio ruolo
            </button>
          </div>
        )}

      </main>
    </div>
  )
}
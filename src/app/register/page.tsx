'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [form, setForm] = useState({
    nome: '', username: '', password: '', conferma: '', ruolo: 'Pastor'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.conferma) {
      setError('Le password non coincidono')
      return
    }
    if (form.password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome,
          username: form.username,
          password: form.password,
          ruolo: form.ruolo,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Errore durante la registrazione')
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch {
      setError('Errore di connessione')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 text-3xl"
               style={{background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)'}}>
            ✓
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
            Richiesta inviata!
          </h2>
          <p className="text-sm mb-6" style={{color: 'var(--text-secondary)'}}>
            Il tuo account è in attesa di approvazione dall&apos;Admin. Riceverai accesso una volta approvato.
          </p>
          <Link href="/login"
            className="text-sm font-medium"
            style={{color: '#6366f1'}}>
            ← Torna al login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
               style={{background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'}}>
            <span className="text-2xl text-white">✝</span>
          </div>
          <h1 className="text-2xl font-semibold" style={{color: 'var(--text-primary)'}}>Registrati</h1>
          <p className="text-sm mt-1" style={{color: 'var(--text-secondary)'}}>
            Shalom Gospel Church
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 border"
             style={{background: 'var(--bg-card)', borderColor: 'var(--border-color)'}}>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block font-medium"
                     style={{color: 'var(--text-secondary)'}}>
                Nome completo
              </label>
              <input
                value={form.nome}
                onChange={e => setForm({...form, nome: e.target.value})}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors border"
                style={{background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)'}}
                placeholder="Mario Rossi"
                required
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block font-medium"
                     style={{color: 'var(--text-secondary)'}}>
                Username
              </label>
              <input
                value={form.username}
                onChange={e => setForm({...form, username: e.target.value})}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors border"
                style={{background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)'}}
                placeholder="mariorossi"
                required
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block font-medium"
                     style={{color: 'var(--text-secondary)'}}>
                Ruolo richiesto
              </label>
              <select
                value={form.ruolo}
                onChange={e => setForm({...form, ruolo: e.target.value})}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors border"
                style={{background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)'}}>
                <option value="Pastor">Pastor</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block font-medium"
                     style={{color: 'var(--text-secondary)'}}>
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors border"
                style={{background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)'}}
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block font-medium"
                     style={{color: 'var(--text-secondary)'}}>
                Conferma password
              </label>
              <input
                type="password"
                value={form.conferma}
                onChange={e => setForm({...form, conferma: e.target.value})}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors border"
                style={{background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)'}}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl px-4 py-2.5 text-sm border border-red-500/20"
                   style={{background: 'rgba(239,68,68,0.1)', color: '#f87171'}}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{background: loading ? '#374151' : 'linear-gradient(135deg, #6366f1, #8b5cf6)'}}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block"
                        style={{animation: 'spin 0.8s linear infinite'}}/>
                  Invio richiesta...
                </span>
              ) : 'Richiedi accesso'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-4" style={{color: 'var(--text-secondary)'}}>
          Hai già un account?{' '}
          <Link href="/login" className="font-medium" style={{color: '#6366f1'}}>
            Accedi
          </Link>
        </p>
      </div>
    </div>
  )
}
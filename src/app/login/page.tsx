'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Credenziali non valide')
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Errore di connessione')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{background: 'var(--bg-primary)'}}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
               style={{background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'}}>
            <span className="text-2xl text-white">✝</span>
          </div>
          <h1 className="text-2xl font-semibold text-white">SGC BibleVerse</h1>
          <p className="text-gray-500 text-sm mt-1">Shalom Gospel Church</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 border border-white/10"
             style={{background: 'var(--bg-card)'}}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">
                Username
              </label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors border border-white/10 focus:border-indigo-500/60"
                style={{background: 'var(--bg-secondary)'}}
                placeholder="username"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors border border-white/10 focus:border-indigo-500/60"
                style={{background: 'var(--bg-secondary)'}}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl px-4 py-2.5 text-red-400 text-sm border border-red-500/20"
                   style={{background: 'rgba(239,68,68,0.1)'}}>
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
                  Accesso...
                </span>
              ) : 'Accedi'}
            </button>
          </form>
        <p className="text-center text-sm mt-4" style={{color: 'var(--text-secondary)'}}>
          Non hai un account?{' '}
          <Link href="/register" className="font-medium" style={{color: '#6366f1'}}>
            Richiedi accesso
          </Link>
        </p>
        </div>
        

        <p className="text-center text-gray-600 text-xs mt-6">
          Accesso riservato ai membri autorizzati
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import type { Verse, LogEntry, Utente } from '@/lib/supabase'

// ─── VERSE CARD ───────────────────────────────────────────
function VerseCard({
  verse, user, onApprove, onRefuse, loadingId
}: {
  verse: Verse
  user: Utente
  onApprove: (v: Verse) => void
  onRefuse: (v: Verse) => void
  loadingId: number | null
}) {
  const isLoading = loadingId === verse.id
  const isDone = verse.stato === 'approved' || verse.stato === 'refused'

  return (
    <div className={`rounded-2xl p-5 border transition-all ${
      verse.stato === 'approved' ? 'border-green-500/20 bg-green-500/3' :
      verse.stato === 'refused'  ? 'border-red-500/20 bg-red-500/3' :
      'border-white/6 hover:border-indigo-500/30'
    }`} style={{background: verse.stato === 'pending' ? 'rgba(255,255,255,0.02)' : undefined}}>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg">
            #{verse.numero}
          </span>
          <div>
            <p className="text-sm font-semibold text-white">{verse.riferimento_ita}</p>
            <p className="text-xs text-gray-500 mt-0.5">{verse.riferimento_sin}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
          verse.stato === 'pending'      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
          verse.stato === 'approved'     ? 'bg-green-500/10 text-green-400 border-green-500/20' :
          verse.stato === 'refused'      ? 'bg-red-500/10 text-red-400 border-red-500/20' :
          'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
        }`}>
          {verse.stato === 'pending'  ? '⏳ In attesa' :
           verse.stato === 'approved' ? '✓ Approvato'  :
           verse.stato === 'refused'  ? '✕ Rifiutato'  : '↻ Rigenerato'}
        </span>
      </div>

      {/* Testi */}
      <div className="space-y-3 mb-4">
        <div className="rounded-xl p-3.5 border border-white/5" style={{background: 'var(--bg-card)'}}>
          <p className="text-xs text-indigo-400 font-medium mb-1.5 uppercase tracking-wider">Italiano — NR</p>
          <p className="text-sm text-gray-200 leading-relaxed">{verse.testo_ita}</p>
        </div>
        <div className="rounded-xl p-3.5 border border-white/5" style={{background: 'var(--bg-card)'}}>
          <p className="text-xs text-purple-400 font-medium mb-1.5 uppercase tracking-wider">සිංහල — Old Version</p>
          <p className="text-sm text-gray-300 leading-relaxed">{verse.testo_sin}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          <span className="text-gray-600">Tema: </span>
          <span className="text-gray-400">{verse.tema}</span>
        </span>

        {isLoading ? (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{background: 'var(--bg-secondary)'}}>
            <span className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full inline-block"
                  style={{animation: 'spin 0.8s linear infinite'}}/>
            <span className="text-xs text-gray-400">
              {verse.stato === 'refused' ? 'Rigenerando...' : 'Salvando...'}
            </span>
          </div>
        ) : isDone ? (
          <span className="text-xs text-gray-500 italic">
            {verse.stato === 'approved' ? `✓ ${verse.approvato_da || user.nome}` : '✕ Rifiutato'}
          </span>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => onRefuse(verse)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-red-200 transition-all hover:scale-105"
              style={{background: 'linear-gradient(135deg, #7f1d1d, #991b1b)', border: '1px solid rgba(239,68,68,0.25)'}}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Rifiuta
            </button>
            <button onClick={() => onApprove(verse)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-green-200 transition-all hover:scale-105"
              style={{background: 'linear-gradient(135deg, #166534, #15803d)', border: '1px solid rgba(34,197,94,0.25)'}}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M2 7L5.5 10.5L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Approva
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── LOG TABLE ────────────────────────────────────────────
function LogTable({ logs }: { logs: LogEntry[] }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/6" style={{background: 'var(--bg-card)'}}>
      <div className="px-5 py-4 border-b border-white/5">
        <h3 className="text-sm font-semibold text-white">Log Azioni</h3>
        <p className="text-xs text-gray-500 mt-0.5">{logs.length} azioni registrate</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['Timestamp','Riferimento','Azione','Utente','Ruolo'].map(h => (
                <th key={h} className="text-left text-xs text-gray-500 uppercase tracking-wider px-5 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                <td className="px-5 py-3.5 text-xs font-mono text-gray-500">
                  {new Date(log.created_at).toLocaleString('it-IT')}
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-300 font-medium">{log.riferimento}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    log.azione === 'approved'    ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    log.azione === 'refused'     ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    log.azione === 'regenerated' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  }`}>
                    {log.azione === 'approved'    ? '✓ Approvato'  :
                     log.azione === 'refused'     ? '✕ Rifiutato'  :
                     log.azione === 'regenerated' ? '↻ Rigenerato' : log.azione}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-300">{log.utente}</td>
                <td className="px-5 py-3.5">
                  <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-md">{log.ruolo}</span>
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-600">
                  Nessuna azione registrata
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

type Utente2 = {
  id: number
  nome: string
  username: string
  ruolo: string
  stato: string
  avatar: string
  created_at: string
}

function UsersTab({ currentUser }: { currentUser: Utente }) {
  const [users, setUsers] = useState<Utente2[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingId, setLoadingId] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/utenti')
      .then(r => r.json())
      .then(setUsers)
      .finally(() => setLoading(false))
  }, [])

  const handleApprove = async (user: Utente2) => {
    setLoadingId(user.id)
    await fetch('/api/utenti/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, ruolo: user.ruolo }),
    })
    setUsers(us => us.map(u => u.id === user.id ? { ...u, stato: 'approved', attivo: true } : u))
    setLoadingId(null)
  }

  const handleRefuse = async (user: Utente2) => {
    setLoadingId(user.id)
    await fetch('/api/utenti/refuse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id }),
    })
    setUsers(us => us.map(u => u.id === user.id ? { ...u, stato: 'refused' } : u))
    setLoadingId(null)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <span className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full inline-block"
            style={{animation: 'spin 0.8s linear infinite'}}/>
    </div>
  )

  const pending = users.filter(u => u.stato === 'pending')
  const others = users.filter(u => u.stato !== 'pending')

  return (
    <div className="space-y-6">
      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"
              style={{color: 'var(--text-primary)'}}>
            <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"/>
            In attesa di approvazione ({pending.length})
          </h3>
          <div className="space-y-2">
            {pending.map(user => (
              <div key={user.id}
                   className="rounded-2xl p-4 border flex items-center justify-between gap-4"
                   style={{background: 'var(--bg-card)', borderColor: 'rgba(234,179,8,0.2)'}}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                       style={{background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'}}>
                    {user.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{color: 'var(--text-primary)'}}>{user.nome}</p>
                    <p className="text-xs" style={{color: 'var(--text-secondary)'}}>@{user.username}</p>
                  </div>
                  <select
                    defaultValue={user.ruolo}
                    onChange={e => setUsers(us => us.map(u => u.id === user.id ? {...u, ruolo: e.target.value} : u))}
                    className="text-xs rounded-lg px-2 py-1 border outline-none ml-2"
                    style={{background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)'}}>
                    <option value="Pastor">Pastor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-2 shrink-0">
                  {loadingId === user.id ? (
                    <span className="w-5 h-5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full inline-block"
                          style={{animation: 'spin 0.8s linear infinite'}}/>
                  ) : (
                    <>
                      <button onClick={() => handleRefuse(user)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium text-red-200 transition-all hover:scale-105"
                        style={{background: 'linear-gradient(135deg, #7f1d1d, #991b1b)', border: '1px solid rgba(239,68,68,0.25)'}}>
                        ✕ Rifiuta
                      </button>
                      <button onClick={() => handleApprove(user)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium text-green-200 transition-all hover:scale-105"
                        style={{background: 'linear-gradient(135deg, #166534, #15803d)', border: '1px solid rgba(34,197,94,0.25)'}}>
                        ✓ Approva
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All users */}
      <div>
        <h3 className="text-sm font-semibold mb-3" style={{color: 'var(--text-primary)'}}>
          Tutti gli utenti ({others.length})
        </h3>
        <div className="rounded-2xl overflow-hidden border"
             style={{background: 'var(--bg-card)', borderColor: 'var(--border-color)'}}>
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{borderColor: 'var(--border-color)'}}>
                {['Utente', 'Username', 'Ruolo', 'Stato', 'Data'].map(h => (
                  <th key={h} className="text-left text-xs uppercase tracking-wider px-5 py-3 font-medium"
                      style={{color: 'var(--text-secondary)'}}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {others.map(user => (
                <tr key={user.id} className="border-b transition-colors"
                    style={{borderColor: 'var(--border-color)'}}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                           style={{background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'}}>
                        {user.avatar}
                      </div>
                      <span className="text-sm" style={{color: 'var(--text-primary)'}}>{user.nome}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{color: 'var(--text-secondary)'}}>@{user.username}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs px-2 py-0.5 rounded-md"
                          style={{background: 'var(--bg-secondary)', color: 'var(--text-secondary)'}}>
                      {user.ruolo}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      user.stato === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      user.stato === 'refused'  ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {user.stato === 'approved' ? '✓ Attivo' :
                       user.stato === 'refused'  ? '✕ Rifiutato' : '⏳ In attesa'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-mono" style={{color: 'var(--text-muted)'}}>
                    {new Date(user.created_at).toLocaleDateString('it-IT')}
                  </td>
                </tr>
              ))}
              {others.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm"
                      style={{color: 'var(--text-muted)'}}>
                    Nessun utente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── DASHBOARD ────────────────────────────────────────────
export default function DashboardClient({
  user, initialVerses, initialLogs
}: {
  user: Utente
  initialVerses: Verse[]
  initialLogs: LogEntry[]
}) {
  const [tab, setTab] = useState<'versetti' | 'log' | 'utenti'>('versetti')
  const [verses, setVerses] = useState<Verse[]>(initialVerses)
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs)
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [] = useTransition()
  const router = useRouter()

  const today = new Date().toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  const pendingCount = verses.filter(v => v.stato === 'pending').length
  const approvedCount = verses.filter(v => v.stato === 'approved').length

    const handleApprove = async (verse: Verse) => {
        setLoadingId(verse.id)
        const toastId = toast.loading(`Approvando "${verse.riferimento_ita}"...`)
        try {
            await fetch('/api/versetti/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                versetto_id: verse.id,
                riferimento_ita: verse.riferimento_ita,
                utente: user.nome,
                ruolo: user.ruolo,
                row_number: verse.row_number,
            }),
            })
            setVerses(vs => vs.map(v => v.id === verse.id
            ? { ...v, stato: 'approved', approvato_da: user.nome } : v))
            setLogs(ls => [{
            id: Date.now(), versetto_id: verse.id,
            riferimento: verse.riferimento_ita, azione: 'approved',
            utente: user.nome, ruolo: user.ruolo,
            created_at: new Date().toISOString()
            }, ...ls])
            toast.success(`✓ "${verse.riferimento_ita}" approvato!`, { id: toastId })
        } catch {
            toast.error('Errore durante l\'approvazione', { id: toastId })
        }
        setLoadingId(null)
    }

    const handleRefuse = async (verse: Verse) => {
        setLoadingId(verse.id)
        const toastId = toast.loading(`Rifiutando e rigenerando...`)
        try {
            await fetch('/api/versetti/refuse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                versetto_id: verse.id,
                riferimento_ita: verse.riferimento_ita,
                utente: user.nome,
                ruolo: user.ruolo,
                row_number: verse.row_number,
            }),
            })
            setVerses(vs => vs.map(v => v.id === verse.id ? { ...v, stato: 'refused' } : v))
            setLogs(ls => [
            { id: Date.now(), versetto_id: verse.id, riferimento: verse.riferimento_ita, azione: 'refused', utente: user.nome, ruolo: user.ruolo, created_at: new Date().toISOString() },
            { id: Date.now()+1, versetto_id: verse.id, riferimento: verse.riferimento_ita, azione: 'regenerated', utente: 'Gemini AI', ruolo: 'Sistema', created_at: new Date().toISOString() },
            ...ls
            ])
            toast.success('↻ Gemini sta generando un versetto sostitutivo', { id: toastId })
        } catch {
            toast.error('Errore durante il rifiuto', { id: toastId })
        }
        setLoadingId(null)
    }

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/login')
        router.refresh()
    }

  return (
    <div className="min-h-screen" style={{background: 'var(--bg-primary)'}}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1a1a2e', color: '#e8e6e0', border: '1px solid rgba(255,255,255,0.08)' },
          duration: 4000,
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/6"
              style={{background: 'var(--bg-primary)', backdropFilter: 'blur(12px)'}}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm text-white"
                 style={{background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'}}>✝</div>
            <div>
              <h1 className="text-sm font-semibold text-white leading-none">SGC BibleVerse</h1>
              <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">{today}</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-white leading-none">{pendingCount}</p>
              <p className="text-xs text-yellow-500 mt-0.5">In attesa</p>
            </div>
            <div className="w-px h-8 bg-white/10"/>
            <div className="text-center">
              <p className="text-lg font-semibold text-white leading-none">{approvedCount}</p>
              <p className="text-xs text-green-500 mt-0.5">Approvati</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-medium text-white">{user.nome}</p>
              <p className="text-xs text-indigo-400">{user.ruolo}</p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                 style={{background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'}}>
              {user.avatar}
            </div>
            <button onClick={handleLogout}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
              Esci
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-white/6 sticky top-14.25 z-30"
           style={{background: 'var(--bg-primary)'}}>
        <div className="max-w-5xl mx-auto px-4 flex">
            {[
                { id: 'versetti', label: 'Versetti', icon: '📖', badge: pendingCount > 0 ? pendingCount : null },
                { id: 'log',      label: 'Log',      icon: '📋', badge: null },
                ...(user.ruolo === 'Admin' ? [{ id: 'utenti', label: 'Utenti', icon: '👥', badge: null }] : []),
            ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as 'versetti' | 'log' | 'utenti')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                tab === t.id
                  ? 'text-white border-indigo-500'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {t.badge && (
                <span className="text-xs px-1.5 py-0.5 rounded-full border bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {tab === 'versetti' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-white">Versetti di oggi</h2>
                <p className="text-xs text-gray-500 mt-0.5">{verses.length} versetti proposti da Gemini</p>
              </div>
              {pendingCount === 0 && verses.length > 0 && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-green-500/10 text-green-400 border-green-500/20">
                  ✓ Tutti revisionati
                </span>
              )}
              {verses.length === 0 && (
                <span className="text-xs text-gray-500">Nessun versetto per oggi — il workflow gira alle 02:22</span>
              )}
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              {verses.map(v => (
                <VerseCard
                  key={v.id} verse={v} user={user}
                  onApprove={handleApprove} onRefuse={handleRefuse}
                  loadingId={loadingId}
                />
              ))}
            </div>
          </div>
        )}

        {tab === 'log' && <LogTable logs={logs} />}
            {tab === 'utenti' && user.ruolo === 'Admin' && (
            <div>
                <div className="mb-5">
                <h2 className="text-base font-semibold" style={{color: 'var(--text-primary)'}}>Gestione Utenti</h2>
                <p className="text-xs mt-0.5" style={{color: 'var(--text-secondary)'}}>Approva o rifiuta le richieste di accesso</p>
                </div>
                <UsersTab currentUser={user} />
            </div>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

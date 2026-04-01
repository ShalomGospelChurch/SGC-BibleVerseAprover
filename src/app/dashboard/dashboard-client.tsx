'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import type { Verse, LogEntry, Utente } from '@/lib/supabase'
import { BookOpen, Copy } from 'lucide-react'

// ─── VERSE CARD MODERNA ───────────────────────────────────────────
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
    <div className={`group rounded-2xl p-6 border transition-all duration-300 ${
      verse.stato === 'approved' ? 'border-green-500/30 bg-green-500/5' :
      verse.stato === 'refused'  ? 'border-red-500/30 bg-red-500/5' :
      'border-white/5 bg-white/2 hover:bg-white/4 hover:border-white/10'
    }`}>
      
      {/* Header: Info & Status */}
      <div className="flex items-start justify-between mb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 w-7 h-7 rounded-lg">
              {verse.numero}
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">{verse.riferimento_ita}</h3>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-500 font-medium">{verse.riferimento_sin}</p>
            <span className="w-1 h-1 rounded-full bg-gray-800" />
            <span className="text-[10px] uppercase tracking-widest text-indigo-400/80 font-bold">
              {verse.tema}
            </span>
          </div>
        </div>
        
        <div className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${
          verse.stato === 'pending'      ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
          verse.stato === 'approved'     ? 'bg-green-500/10 text-green-500 border-green-500/20' :
          'bg-red-500/10 text-red-500 border-red-500/20'
        }`}>
          {verse.stato === 'pending' ? 'Pending' : verse.stato}
        </div>
      </div>

      {/* Texts */}
      <div className="grid gap-4 mb-6">
        <div className="relative group/text">
          <p className="text-[10px] text-indigo-400/60 font-bold uppercase mb-1.5 px-1 tracking-tight">Italiano (NR)</p>
          <p className="text-[15px] text-gray-200 leading-relaxed font-medium bg-white/3 p-4 rounded-xl border border-white/5">
            {verse.testo_ita}
          </p>
        </div>
        
        <div className="relative group/text">
          <p className="text-[10px] text-purple-400/60 font-bold uppercase mb-1.5 px-1 tracking-tight">Sinhala (OV)</p>
          <p className="text-[17px] text-gray-300 leading-relaxed font-medium bg-white/3 p-4 rounded-xl border border-white/5" style={{lineHeight: '1.6'}}>
            {verse.testo_sin}
          </p>
        </div>
      </div>

      {/* Footer: Actions */}
      <div className="flex items-center justify-end pt-4 border-t border-white/5">
        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <span className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <span className="text-xs font-medium italic">Processing...</span>
          </div>
        ) : isDone ? (
          <p className="text-xs text-gray-500 font-medium italic">
            {verse.stato === 'approved' ? `✓ Approved by ${verse.approvato_da || user.nome}` : '✕ Refused'}
          </p>
        ) : (
          <div className="flex gap-3">
            <button onClick={() => onRefuse(verse)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all border border-red-500/10">
              Refuse
            </button>
            <button onClick={() => onApprove(verse)}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/10 active:scale-95 border border-indigo-400/20">
              Approve Verse
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
    <div className="rounded-2xl overflow-hidden border border-white/5 bg-white/2">
      <div className="px-5 py-4 border-b border-white/5 bg-white/1">
        <h3 className="text-sm font-bold text-white">Log Azioni</h3>
        <p className="text-xs text-gray-500 mt-0.5">{logs.length} azioni registrate</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5">
              {['Timestamp','Riferimento','Azione','Utente'].map(h => (
                <th key={h} className="text-[10px] text-gray-500 uppercase tracking-widest px-5 py-3 font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-white/2 hover:bg-white/2 transition-colors">
                <td className="px-5 py-3.5 text-xs font-mono text-gray-500">
                  {new Date(log.created_at).toLocaleString('it-IT')}
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-300 font-semibold">{log.riferimento}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    log.azione === 'approved'    ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    log.azione === 'refused'     ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }`}>
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
  )
}

// ─── USERS TAB (ADMIN ONLY) ──────────────────────────────
type Utente2 = { id: number; nome: string; username: string; ruolo: string; stato: string; avatar: string; created_at: string }

function UsersTab({ }: { currentUser: Utente }) {
  const [users, setUsers] = useState<Utente2[]>([])
  const [loading, setLoading] = useState(true)
  const [, setLoadingId] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/utenti').then(r => r.json()).then(setUsers).finally(() => setLoading(false))
  }, [])

  const handleApprove = async (user: Utente2) => {
    setLoadingId(user.id)
    await fetch('/api/utenti/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: user.id, ruolo: user.ruolo }) })
    setUsers(us => us.map(u => u.id === user.id ? { ...u, stato: 'approved' } : u))
    setLoadingId(null)
  }

  if (loading) return <div className="flex justify-center py-20"><span className="w-5 h-5 border-2 border-white/10 border-t-white rounded-full animate-spin"/></div>

  return (
    <div className="space-y-6">
      <div className="rounded-2xl overflow-hidden border border-white/5 bg-white/2">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/1">
              {['Utente', 'Ruolo', 'Stato', 'Data'].map(h => (
                <th key={h} className="text-[10px] text-gray-500 uppercase tracking-widest px-5 py-3 font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-white/2">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-indigo-600">
                      {user.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{user.nome}</p>
                      <p className="text-[10px] text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-xs text-gray-300 font-medium">{user.ruolo}</td>
                <td className="px-5 py-3.5">
                    {user.stato === 'pending' ? (
                        <div className="flex gap-2">
                             <button onClick={() => handleApprove(user)} className="text-[10px] font-bold px-3 py-1 bg-white text-black rounded-lg hover:bg-gray-200 transition-all">Approva</button>
                        </div>
                    ) : (
                        <span className="text-[10px] font-bold text-green-400 uppercase tracking-tight">Attivo</span>
                    )}
                </td>
                <td className="px-5 py-3.5 text-xs font-mono text-gray-600">{new Date(user.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── DASHBOARD MAIN ──────────────────────────────────────
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
  const router = useRouter()

  const pendingCount = verses.filter(v => v.stato === 'pending').length

    const handleApprove = async (verse: Verse) => {
        setLoadingId(verse.id)
        const toastId = toast.loading('Salvando...')
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
                    numero: verse.numero  // ← aggiunto
                }),
            })
            setVerses(vs => vs.map(v => v.id === verse.id ? { ...v, stato: 'approved', approvato_da: user.nome } : v))
            setLogs(ls => [{ id: Date.now(), versetto_id: verse.id, riferimento: verse.riferimento_ita, azione: 'approved', utente: user.nome, ruolo: user.ruolo, created_at: new Date().toISOString() }, ...ls])
            toast.success('Approvato!', { id: toastId })
        } catch { toast.error('Errore!', { id: toastId }) }
        setLoadingId(null)
    }

    const handleRefuse = async (verse: Verse) => {
    setLoadingId(verse.id)
    const toastId = toast.loading('Rigenerando...')
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
                numero: verse.numero  // ← aggiunto
            }),
        })
        setVerses(vs => vs.map(v => v.id === verse.id ? { ...v, stato: 'refused' } : v))
        toast.success('Inviato a Gemini per rigenerazione', { id: toastId })
    } catch { toast.error('Errore!', { id: toastId }) }
    setLoadingId(null)
    }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const handleCopyList = () => {
    const text = verses
      .filter(v => v.stato !== 'refused')
      .map(v => `*${v.riferimento_sin}*\n${v.testo_sin}`)
      .join('\n\n')
    navigator.clipboard.writeText(text)
    toast.success('Copiato Lista Sinhala !')
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--bg-primary)'}}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#121212', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-600 shadow-lg shadow-indigo-600/20">
              <BookOpen size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">SGC BibleVerse</h1>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-0.5">Control Center</p>
            </div>
            <button onClick={handleCopyList} title="Copia lista Sinhala"
              className="text-gray-500 hover:text-white transition-colors p-1">
              <Copy size={15} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-white">{user.nome}</p>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter">{user.ruolo}</p>
            </div>
            <button onClick={handleLogout} className="text-[10px] font-bold text-gray-500 hover:text-white uppercase transition-colors">Esci</button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-white/5 bg-[#0a0a0c]/40">
        <div className="max-w-4xl mx-auto px-6 flex gap-8">
            {['versetti', 'log', 'utenti'].map((t) => (
                (t !== 'utenti' || user.ruolo === 'Admin') && (
                    <button key={t} onClick={() => setTab(t as never)}
                        className={`py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all border-b-2 ${
                        tab === t ? 'text-white border-white' : 'text-gray-600 border-transparent hover:text-gray-400'
                        }`}>
                        {t} {t === 'versetti' && pendingCount > 0 && <span className="ml-1 text-indigo-400">({pendingCount})</span>}
                    </button>
                )
            ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        {tab === 'versetti' && (
          <div className="space-y-10">
            <div className="flex items-end justify-between px-2">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Daily Verses</h2>
                <p className="text-sm text-gray-500 font-medium">Revisiona i contenuti generati da Gemini per oggi.</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-white/10 block leading-none">{verses.length}</span>
                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Totali</span>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {verses.map(v => (
                <VerseCard key={v.id} verse={v} user={user} onApprove={handleApprove} onRefuse={handleRefuse} loadingId={loadingId} />
              ))}
            </div>
          </div>
        )}

        {tab === 'log' && <LogTable logs={logs} />}
        {tab === 'utenti' && user.ruolo === 'Admin' && <UsersTab currentUser={user} />}
      </main>
    </div>
  )
}

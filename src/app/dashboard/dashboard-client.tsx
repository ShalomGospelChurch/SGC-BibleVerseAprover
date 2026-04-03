'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import type { Verse, Utente } from '@/lib/supabase'
import { BookOpen, Copy, Sparkles } from 'lucide-react'
import Navbar from '@/components/Navbar'

// ─── VERSE CARD ───────────────────────────────────────────────────
function VerseCard({
  verse,  onApprove, onRefuse, loadingId
}: {
  verse: Verse
  user: Utente
  onApprove: (v: Verse) => void
  onRefuse: (v: Verse) => void
  loadingId: number | null
}) {
  const isLoading = loadingId === verse.id

  return (
    <div className="group rounded-2xl p-6 border border-white/5 bg-white/2 hover:bg-white/4 hover:border-white/10 transition-all duration-300">
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
            <span className="text-[10px] uppercase tracking-widest text-indigo-400/80 font-bold">{verse.tema}</span>
          </div>
        </div>
        <div className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          Pending
        </div>
      </div>

      <div className="grid gap-4 mb-6">
        <div>
          <p className="text-[10px] text-indigo-400/60 font-bold uppercase mb-1.5 px-1 tracking-tight">Italiano (NR)</p>
          <p className="text-[15px] text-gray-200 leading-relaxed font-medium bg-white/3 p-4 rounded-xl border border-white/5">{verse.testo_ita}</p>
        </div>
        <div>
          <p className="text-[10px] text-purple-400/60 font-bold uppercase mb-1.5 px-1 tracking-tight">Sinhala (OV)</p>
          <p className="text-[17px] text-gray-300 leading-relaxed font-medium bg-white/3 p-4 rounded-xl border border-white/5" style={{lineHeight: '1.6'}}>{verse.testo_sin}</p>
        </div>
      </div>

      <div className="flex items-center justify-end pt-4 border-t border-white/5">
        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <span className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <span className="text-xs font-medium italic">Processing...</span>
          </div>
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

// ─── DASHBOARD MAIN ──────────────────────────────────────
export default function DashboardClient({
  user, initialVerses, stats
}: {
  user: Utente
  initialVerses: Verse[]
  stats: { pending: number; approvati: number; completati: number }
}) {
  const [verses, setVerses] = useState<Verse[]>(initialVerses)
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [generando, setGenerando] = useState(false)
  const router = useRouter()

  const pendingCount = verses.length

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
          riferimento_sin: verse.riferimento_sin,
          utente: user.nome,
          ruolo: user.ruolo,
          numero: verse.numero
        }),
      })
      setVerses(vs => vs.filter(v => v.id !== verse.id))
      toast.success('Approvato!', { id: toastId })
      router.refresh()
    } catch { toast.error('Errore!', { id: toastId }) }
    setLoadingId(null)
  }

  const handleRefuse = async (verse: Verse) => {
    setLoadingId(verse.id)
    const toastId = toast.loading('Rimuovendo...')
    try {
      await fetch('/api/versetti/refuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versetto_id: verse.id, riferimento_ita: verse.riferimento_ita, utente: user.nome, ruolo: user.ruolo }),
      })
      setVerses(vs => vs.filter(v => v.id !== verse.id))
      toast.success('Rimosso!', { id: toastId })
      toast.success('Rimosso!', { id: toastId })
      router.refresh()
    } catch { toast.error('Errore!', { id: toastId }) }
    setLoadingId(null)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const handleCopyList = () => {
    const text = verses
      .map(v => `*${v.riferimento_sin}*\n${v.testo_sin}`)
      .join('\n\n')
    navigator.clipboard.writeText(text)
    toast.success('Copiato Lista Sinhala!')
  }

  const handleGenera = async () => {
    if (!confirm('Generare nuovi versetti con Gemini?')) return
    setGenerando(true)
    const toastId = toast.loading('Gemini sta generando versetti...')
    try {
      const res = await fetch('/api/versetti/genera', { method: 'POST' })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      toast.success(`${data.count} versetti generati!`, { id: toastId })
      router.refresh()
    } catch {
      toast.error('Errore generazione', { id: toastId })
    }
    setGenerando(false)
  }

  useEffect(() => {
    if (user.ruolo !== 'SuperAdmin') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    const register = async () => {
      const reg = await navigator.serviceWorker.register('/sw.js')
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return

      const existing = await reg.pushManager.getSubscription()
      const sub = existing || await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub)
      })

      if (stats.pending < 10) {
        await fetch('/api/push/send', { method: 'POST' })
      }
    }

    register()
  }, [user.ruolo, stats.pending])

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
            {user.ruolo === 'SuperAdmin' && (
              <button onClick={handleGenera} disabled={generando} title="Genera versetti"
                className="text-gray-500 hover:text-indigo-400 transition-colors p-1">
                {generando
                  ? <span className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin block" />
                  : <Sparkles size={15} />
                }
              </button>
            )}
              

          </div>
          <div className="flex items-center gap-4">
            <a href="/profilo" className="hidden sm:block text-right hover:opacity-80 transition-opacity">
              <p className="text-xs font-bold text-white">{user.nome}</p>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter">{user.ruolo}</p>
            </a>
            <button onClick={handleLogout} className="text-[10px] font-bold text-gray-500 hover:text-white uppercase transition-colors">Esci</button>
          </div>
        </div>
      </header>

      {/* Navbar */}
      <Navbar user={user} />


      {user.ruolo === 'SuperAdmin' && (
        <div className="max-w-3xl mx-auto px-6 py-4">
          {stats.pending < 10 && (
            <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10">
              <span className="text-yellow-400 text-xs font-bold uppercase tracking-widest">!</span>
              <div>
                <p className="text-xs font-bold text-yellow-400">Versetti in esaurimento</p>
                <p className="text-[10px] text-yellow-400/70">Solo {stats.pending} pending rimasti — considera di generarne altri con il bottone in alto</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/5 bg-white/2 p-4 text-center">
              <span className="text-2xl font-black text-yellow-400">{stats.pending}</span>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">Pending</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/2 p-4 text-center">
              <span className="text-2xl font-black text-green-400">{stats.approvati}</span>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">Approvati</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/2 p-4 text-center">
              <span className="text-2xl font-black text-indigo-400">{stats.completati}</span>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">Completati</p>
            </div>
          </div>
        </div>
      )}


      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="space-y-10">
          <div className="flex items-end justify-between px-2">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Daily Verses</h2>
              <p className="text-sm text-gray-500 font-medium">Revisiona i contenuti generati da Gemini.</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-white/10 block leading-none">{pendingCount}</span>
              <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">In coda</span>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            {verses.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-sm">Nessun versetto in attesa.</p>
                {user.ruolo === 'SuperAdmin' && (
                  <button onClick={handleGenera} disabled={generando}
                    className="mt-4 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all">
                    ✨ Genera nuovi versetti
                  </button>
                )}
              </div>
            ) : (
              verses.map(v => (
                <VerseCard key={v.id} verse={v} user={user} onApprove={handleApprove} onRefuse={handleRefuse} loadingId={loadingId} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
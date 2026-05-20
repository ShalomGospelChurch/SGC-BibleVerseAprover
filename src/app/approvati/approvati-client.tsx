'use client'

import { useState, useRef, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import type { Verse, Utente } from '@/lib/supabase'
import { Copy, Check, ImagePlus, X, RefreshCw, Download, Upload } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Header from '@/components/Header'

const PALETTES = [
  { id: 'gold', label: 'Gold', bg: 'warm gold and amber watercolor', textColor: '#1a0a00' },
  { id: 'blue', label: 'Ocean', bg: 'soft blue and teal watercolor', textColor: '#001a2c' },
  { id: 'rose', label: 'Rose', bg: 'pastel pink and rose gold watercolor', textColor: '#2c0a14' },
  { id: 'sage', label: 'Sage', bg: 'sage green and cream watercolor', textColor: '#0a1a0a' },
  { id: 'purple', label: 'Royal', bg: 'deep purple and lavender watercolor', textColor: '#1a0a2c' },
  { id: 'sunset', label: 'Sunset', bg: 'orange and coral sunset watercolor', textColor: '#1a0500' },
]

const STILI = [
  { id: 'watercolor', label: 'Acquerello', prompt: 'fluid watercolor texture, soft edges, minimalist' },
  { id: 'marble', label: 'Marmo', prompt: 'elegant marble texture, luxury, smooth' },
  { id: 'abstract', label: 'Astratto', prompt: 'abstract alcohol ink texture, flowing colors' },
  { id: 'minimal', label: 'Minimal', prompt: 'minimal gradient background, clean, soft light' },
]

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ')
  let line = ''
  const lines: string[] = []
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' '
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      lines.push(line)
      line = words[n] + ' '
    } else {
      line = testLine
    }
  }
  lines.push(line)
  const startY = y - ((lines.length - 1) * lineHeight) / 2
  lines.forEach((l, i) => ctx.fillText(l.trim(), x, startY + i * lineHeight))
}

function ImageModal({ verse, onClose, onDone, user }: {
  verse: Verse
  onClose: () => void
  onDone: (verse: Verse) => void
  user: Utente
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [palette, setPalette] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('sgc-palette') || 'gold'
    return 'gold'
  })
  const [stile, setStile] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('sgc-stile') || 'watercolor'
    return 'watercolor'
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [generato, setGenerato] = useState(false)

  const selectedPalette = PALETTES.find(p => p.id === palette) || PALETTES[0]
  const selectedStile = STILI.find(s => s.id === stile) || STILI[0]

  useEffect(() => {
    localStorage.setItem('sgc-palette', palette)
    localStorage.setItem('sgc-stile', stile)
  }, [palette, stile])

  const disegnaCanvas = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.fillRect(0, 0, 1080, 1080)

    ctx.font = 'bold 28px Georgia'
    ctx.fillStyle = selectedPalette.textColor + '99'
    ctx.textAlign = 'center'
    ctx.fillText('✦ SHALOM GOSPEL CHURCH ✦', 540, 80)

    ctx.font = 'italic bold 42px Georgia'
    ctx.fillStyle = selectedPalette.textColor
    ctx.textAlign = 'center'
    wrapText(ctx, `"${verse.testo_ita}"`, 540, 400, 860, 58)

    ctx.font = 'bold 32px Georgia'
    ctx.fillStyle = selectedPalette.textColor + 'cc'
    ctx.fillText(`— ${verse.riferimento_ita}`, 540, 750)

    ctx.strokeStyle = selectedPalette.textColor + '44'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(340, 790)
    ctx.lineTo(740, 790)
    ctx.stroke()

    ctx.font = '30px serif'
    ctx.fillStyle = selectedPalette.textColor + 'aa'
    wrapText(ctx, verse.testo_sin, 540, 850, 860, 44)
  }

  const genera = async () => {
    setLoading(true)
    setGenerato(false)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const prompt = `${selectedPalette.bg}, ${selectedStile.prompt}, no text, no people, no cross, clean background for bible verse card`
    const seed = Math.floor(Math.random() * 99999)
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1080&seed=${seed}&nologo=true`

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = url
    img.onload = () => {
      ctx.clearRect(0, 0, 1080, 1080)
      ctx.drawImage(img, 0, 0, 1080, 1080)
      disegnaCanvas(ctx)
      setLoading(false)
      setGenerato(true)
    }
    img.onerror = () => {
      // Fallback gradiente se Pollinations non risponde (es. localhost)
      ctx.clearRect(0, 0, 1080, 1080)
      const gradient = ctx.createLinearGradient(0, 0, 1080, 1080)
      gradient.addColorStop(0, '#f5e6c8')
      gradient.addColorStop(1, '#e8d5a3')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 1080, 1080)
      disegnaCanvas(ctx)
      setLoading(false)
      setGenerato(true)
      toast('Sfondo di fallback usato (funzionerà su Vercel)', { icon: '⚠️' })
    }
  }

  const scarica = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${verse.riferimento_ita.replace(/\s/g, '_')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const salvaESegna = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setUploading(true)
    try {
      const blob = await new Promise<Blob>((res) => canvas.toBlob(b => res(b!), 'image/png'))
      const formData = new FormData()
      formData.append('file', blob, `${verse.id}.png`)
      formData.append('versetto_id', String(verse.id))
      formData.append('riferimento_ita', verse.riferimento_ita)
      formData.append('utente', user.nome)
      formData.append('ruolo', user.ruolo)

      const res = await fetch('/api/versetti/upload-immagine', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error()
      toast.success('Immagine salvata!')
      onDone(verse)
      onClose()
    } catch {
      toast.error('Errore nel salvataggio')
    }
    setUploading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0f0f11] border border-white/10 rounded-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <div>
            <h3 className="text-sm font-bold text-white">{verse.riferimento_ita}</h3>
            <p className="text-[10px] text-gray-500">{verse.tema}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Canvas preview */}
        <div className="relative w-72 mx-auto mt-4 aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/5">
          <canvas ref={canvasRef} width={1080} height={1080} className="w-full h-full object-contain" />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-[10px] text-gray-400">Generando...</p>
              </div>
            </div>
          )}
        </div>

        {/* Opzioni + Bottoni */}
        <div className="px-5 py-4 space-y-3">
          {/* Palette */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold w-12">Palette</span>
            {PALETTES.map(p => (
              <button key={p.id} onClick={() => setPalette(p.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                  palette === p.id
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                    : 'border-white/10 text-gray-500 hover:text-gray-300'
                }`}>
                {p.label}
              </button>
            ))}
          </div>

          {/* Stile */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold w-12">Stile</span>
            {STILI.map(s => (
              <button key={s.id} onClick={() => setStile(s.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                  stile === s.id
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                    : 'border-white/10 text-gray-500 hover:text-gray-300'
                }`}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Bottoni */}
          <div className="flex gap-2 pt-1">
            <button onClick={genera} disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all disabled:opacity-50 border border-indigo-400/20">
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              {generato ? 'Rigenera' : 'Genera'}
            </button>

            {generato && (
              <>
                <button onClick={scarica}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-white transition-all border border-white/10 hover:border-white/20">
                  <Download size={12} /> Scarica
                </button>
                <button onClick={salvaESegna} disabled={uploading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-green-400 hover:text-green-300 transition-all border border-green-500/20 hover:bg-green-500/10 disabled:opacity-50 ml-auto">
                  {uploading
                    ? <span className="w-3 h-3 border-2 border-green-500/30 border-t-green-400 rounded-full animate-spin" />
                    : <Upload size={12} />
                  }
                  Salva & Completa
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ApprovatiClient({ user, initialApprovati }: {
  user: Utente
  initialApprovati: Verse[]
}) {
  const [approvati, setApprovati] = useState<Verse[]>(initialApprovati)
  const [search, setSearch] = useState('')
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [modalVerse, setModalVerse] = useState<Verse | null>(null)

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
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#121212', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />

      {modalVerse && (
        <ImageModal
          verse={modalVerse}
          user={user}
          onClose={() => setModalVerse(null)}
          onDone={(v) => {
            setApprovati(vs => vs.filter(x => x.id !== v.id))
            setModalVerse(null)
          }}
        />
      )}

      <Header user={user} subtitle="Approvati" />
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
                    <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
                      <button onClick={() => copyPrompt(v)}
                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors border border-indigo-500/20 px-3 py-1.5 rounded-lg hover:bg-indigo-500/10">
                        <Copy size={12} /> Prompt
                      </button>
                      <button onClick={() => setModalVerse(v)}
                        className="flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors border border-purple-500/20 px-3 py-1.5 rounded-lg hover:bg-purple-500/10">
                        <ImagePlus size={12} />
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
                  <p className="text-sm text-gray-400 leading-relaxed" style={{ lineHeight: '1.6' }}>{v.testo_sin}</p>
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
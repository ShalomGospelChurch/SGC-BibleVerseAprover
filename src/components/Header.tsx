'use client'

import { BookOpen, Copy, Sparkles } from 'lucide-react'
import type { Utente } from '@/lib/supabase'
import { useState } from 'react'
import toast from 'react-hot-toast'
import router from 'next/router'

interface HeaderProps {
  user: Utente
  subtitle?: string
  copyText?: string
}


    
export default function Header({ user, subtitle = 'Control Center', copyText }: HeaderProps) {
  const [generando, setGenerando] = useState(false)
    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/login')
    }

    const handleCopy = () => {
        if (!copyText) return
        navigator.clipboard.writeText(copyText)
        toast.success('Copiato!')
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
        window.location.reload()
        } catch {
        toast.error('Errore generazione', { id: toastId })
        }
        setGenerando(false)
    }

    return (
        <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl">
            <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-600 shadow-lg shadow-indigo-600/20" onClick={() => window.location.reload()} style={{ cursor: 'pointer' }}>
                    <BookOpen size={18} className="text-white" />
                </div>
                <div>
                    <h1 className="text-sm font-bold text-white tracking-tight">SGC BibleVerse</h1>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-0.5">{subtitle}</p>
                </div>
                <button onClick={handleCopy} title="Copia lista Sinhala"
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
                {handleLogout && (
                    <button onClick={handleLogout} className="text-[10px] font-bold text-gray-500 hover:text-white uppercase transition-colors">
                    Esci
                    </button>
                )}
                </div>
            </div>
        </header>
    )
}
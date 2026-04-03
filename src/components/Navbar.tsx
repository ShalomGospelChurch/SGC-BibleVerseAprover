'use client'

import { usePathname } from 'next/navigation'
import type { Utente } from '@/lib/supabase'

export default function Navbar({ user }: { user: Utente }) {
  const pathname = usePathname()

  const canManage = ['SuperAdmin', 'Admin'].includes(user.ruolo)
  const canApprove = ['SuperAdmin', 'Admin', 'Pastore'].includes(user.ruolo)

  const tabs = [
    { href: '/dashboard', label: 'Versetti', show: canApprove },
    { href: '/approvati', label: 'Approvati', show: true },
    { href: '/versetti-usati', label: 'Blacklist', show: canManage },
    { href: '/admin/log', label: 'Logs', show: canManage },
    { href: '/admin/utenti', label: 'Users', show: canManage },

  ].filter(t => t.show)

  return (
    <div className="border-b border-white/5 bg-[#0a0a0c]/40 overflow-x-auto">
      <div className="max-w-4xl mx-auto px-6 flex gap-8">
        {tabs.map(t => (
          <a key={t.href} href={t.href}
            className={`py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all border-b-2 ${
              pathname === t.href
                ? 'text-white border-white'
                : 'text-gray-600 border-transparent hover:text-gray-400'
            }`}>
            {t.label}
          </a>
        ))}
      </div>
    </div>
  )
}
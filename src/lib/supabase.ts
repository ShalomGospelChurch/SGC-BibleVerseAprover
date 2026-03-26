import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Verse = {
  id: number
  data: string
  numero: number
  row_number: number
  riferimento_ita: string
  testo_ita: string
  riferimento_sin: string
  testo_sin: string
  tema: string
  stato: 'pending' | 'approved' | 'refused' | 'regenerated'
  approvato_da?: string
  note?: string
  created_at: string
}

export type LogEntry = {
  id: number
  versetto_id: number
  riferimento: string
  azione: string
  utente: string
  ruolo: string
  note?: string
  created_at: string
}

export type Utente = {
  id: number
  username: string
  nome: string
  ruolo: string
  avatar: string
}
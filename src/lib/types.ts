export type Stato = 'pending' | 'approved' | 'refused' | 'regenerated'

export type Verse = {
  id: number
  row_number: number
  data: string
  numero: number
  riferimento_ita: string
  testo_ita: string
  riferimento_sin: string
  testo_sin: string
  tema: string
  stato: Stato
  approvato_da?: string
}

export type LogEntry = {
  id: number
  timestamp: string
  riferimento: string
  azione: Stato | 'regenerated'
  utente: string
  ruolo: string
}
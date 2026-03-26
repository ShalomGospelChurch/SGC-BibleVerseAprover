export const USERS = [
  {
    username: 'jerry',
    password: 'admin123',
    nome: 'Jerry Fernando',
    ruolo: 'Admin',
    avatar: 'JF',
  },
  {
    username: 'pastore',
    password: 'pastor123',
    nome: 'Pastor Samuel',
    ruolo: 'Pastor',
    avatar: 'PS',
  },
]

export type User = typeof USERS[0]
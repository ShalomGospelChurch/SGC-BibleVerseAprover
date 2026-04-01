// scripts/hash-passwords.ts
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  'https://iijsqjtqeeelfictrnaq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpanNxanRxZWVlbGZpY3RybmFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MzA3OTYsImV4cCI6MjA5MDEwNjc5Nn0.FQ9dW0BqZ-LgE50cORR8sRx8dLnYRkI1AwusHaL6RUk ' // usa la service key, non la anon
)

async function migrate() {
  const { data: users } = await supabase.from('utenti').select('id, password_hash')
  
  for (const user of users!) {
    const hashed = await bcrypt.hash(user.password_hash, 10)
    await supabase.from('utenti').update({ password_hash: hashed }).eq('id', user.id)
    console.log(`✅ Migrato utente ${user.id}`)
  }
  console.log('Done!')
}

migrate()
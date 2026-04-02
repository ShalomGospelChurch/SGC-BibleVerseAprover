import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  'https://iijsqjtqeeelfictrnaq.supabase.co',
  'TUA_SERVICE_KEY'
)

async function migrate() {
  const { data: users } = await supabase.from('utenti').select('id, password_hash')
  
  for (const user of users!) {
    if (!user.password_hash.startsWith('$2b$')) {
      const hashed = await bcrypt.hash(user.password_hash, 10)
      await supabase.from('utenti').update({ password_hash: hashed }).eq('id', user.id)
      console.log(`✅ Migrato utente ${user.id}`)
    } else {
      console.log(`⏭ Saltato utente ${user.id} (già hashato)`)
    }
  }
  console.log('Done!')
}

migrate()
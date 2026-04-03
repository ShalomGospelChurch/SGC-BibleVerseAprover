import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST() {
  try {
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('subscription')

    const payload = JSON.stringify({
      title: 'SGC BibleVerse',
      body: 'I versetti pending sono quasi esauriti! Genera nuovi versetti.',
    })

    await Promise.all(
      subs!.map(s => webpush.sendNotification(s.subscription, payload))
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}
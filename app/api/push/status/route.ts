import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId')
    if (!eventId) return NextResponse.json({ ok: false, error: 'MISSING_EVENT_ID' }, { status: 400 })
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint')
      .eq('event_id', eventId)
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, count: data.length })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

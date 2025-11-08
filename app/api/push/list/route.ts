import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { configureWebPush } from '@/lib/config/vapid'

// 取得指定 event 的所有 push 訂閱（僅供診斷）
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId')
    const tenantId = searchParams.get('tenantId') || undefined
    if (!eventId) {
      return NextResponse.json({ ok: false, error: 'MISSING_EVENT_ID' }, { status: 400 })
    }
    const supabase = createAdminClient()
    configureWebPush() // 確保 VAPID 已初始化（雖不直接用於列出）

    let query = supabase
      .from('push_subscriptions')
      .select('endpoint,p256dh,auth,created_at')
      .eq('event_id', eventId)
    if (tenantId) query = query.eq('tenant_id', tenantId)

    const { data, error } = await query
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    // 簡化傳回：加上 endpointTail 方便前端展示
    const list = (data || []).map((r: any) => ({
      endpoint: r.endpoint,
      endpointTail: r.endpoint.slice(-32),
      p256dh: r.p256dh,
      auth: r.auth,
      created_at: r.created_at,
    }))

    return NextResponse.json({ ok: true, count: list.length, subscriptions: list })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

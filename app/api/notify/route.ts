import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// 需要在環境變數中設定 RESEND_API_KEY
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(req: Request) {
  try {
    if (!resend) {
      return NextResponse.json({ ok: false, error: 'RESEND_NOT_CONFIGURED' }, { status: 500 })
    }
    const body = await req.json()
    const { to, subject, html } = body as { to: string; subject: string; html: string }
    if (!to) return NextResponse.json({ ok: false, error: 'MISSING_TO' }, { status: 400 })

    const data = await resend.emails.send({
      from: 'notify@timealign.example',
      to,
      subject: subject || 'TimeAlign Notification',
      html: html || '<p>You have a new update.</p>',
    })

    return NextResponse.json({ ok: true, id: data?.id })
  } catch (e: any) {
    console.error('Notify API error', e)
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

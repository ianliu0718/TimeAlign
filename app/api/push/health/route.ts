import { NextResponse } from 'next/server'
import { getVapidKeys } from '@/lib/config/vapid'

export async function GET() {
  try {
    // 檢查環境變數是否存在
    const hasPubEnv = !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY)
    const hasPrvEnv = !!process.env.VAPID_PRIVATE_KEY

    // 取得當前使用的金鑰（會依序從 env / file / generate）
    const keys = getVapidKeys(false) // 不自動生成，若不存在會拋錯
    
    // 判斷來源
    let source = 'unknown'
    if (hasPubEnv && hasPrvEnv) {
      source = 'env'
    } else {
      // 如果 env 不完整，代表可能來自檔案或曾經生成
      source = 'file_or_generated'
    }

    return NextResponse.json({
      ok: true,
      source,
      hasPublicEnv: hasPubEnv,
      hasPrivateEnv: hasPrvEnv,
      publicKeyPrefix: keys.publicKey.slice(0, 16) + '...',
      privateKeyExists: !!keys.privateKey,
      timestamp: new Date().toISOString(),
    })
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      error: e.message,
      hasPublicEnv: !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY),
      hasPrivateEnv: !!process.env.VAPID_PRIVATE_KEY,
    }, { status: 500 })
  }
}

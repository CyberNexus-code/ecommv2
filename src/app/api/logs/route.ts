import { NextResponse, type NextRequest } from 'next/server'
import { createServer } from '@/lib/supabase/server'
import { logServerEvent } from '@/lib/logging/server'
import { normalizeLogEntry } from '@/lib/logging/shared'
import type { AppLogEntry } from '@/types/logging'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AppLogEntry
    const payload = normalizeLogEntry(body)
    const supabase = await createServer()
    const { data: { user } } = await supabase.auth.getUser()

    await logServerEvent({
      ...payload,
      userId: user?.id ?? payload.userId ?? null,
      path: payload.path ?? request.nextUrl.pathname,
      metadata: {
        ...(payload.metadata ?? {}),
        userAgent: request.headers.get('user-agent') ?? null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 202 })
  }
}
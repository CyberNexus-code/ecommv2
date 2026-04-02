import { NextRequest, NextResponse } from 'next/server'
import { createServer } from '@/lib/supabase/server'
import { logServerError } from '@/lib/logging/server'
import type { OAuthTokenPayload } from '@/lib/auth/oauthTokens'

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as OAuthTokenPayload
    const supabase = await createServer()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.is_anonymous) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (payload.provider !== 'google' || !payload.accessToken) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { error } = await supabase.from('oauth_provider_tokens').upsert(
      {
        user_id: user.id,
        provider: payload.provider,
        access_token: payload.accessToken,
        refresh_token: payload.refreshToken,
        expires_at: payload.expiresAt,
      },
      { onConflict: 'user_id' },
    )

    if (error) {
      await logServerError('auth.oauthTokens.upsert', error, { userId: user.id })
      return NextResponse.json({ error: 'Unable to save provider tokens' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    await logServerError('auth.oauthTokens.route', error)
    return NextResponse.json({ error: 'Unable to save provider tokens' }, { status: 500 })
  }
}
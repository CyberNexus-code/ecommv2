import type { Session } from '@supabase/supabase-js'
import { createServer } from '@/lib/supabase/server'
import { logServerError } from '@/lib/logging/server'

function getExpiryTimestamp(session: Session): string | null {
  if (!session.expires_at) {
    return null
  }

  return new Date(session.expires_at * 1000).toISOString()
}

export async function saveGoogleOAuthTokens(session: Session | null | undefined) {
  if (!session?.user || session.user.is_anonymous) {
    return
  }

  const provider = session.user.app_metadata?.provider

  if (provider !== 'google' || !session.provider_token) {
    return
  }

  const supabase = await createServer()
  const { error } = await supabase.from('oauth_provider_tokens').upsert({
    user_id: session.user.id,
    provider: 'google',
    access_token: session.provider_token,
    refresh_token: session.provider_refresh_token ?? null,
    expires_at: getExpiryTimestamp(session),
  }, { onConflict: 'user_id' })

  if (error) {
    await logServerError('auth.saveGoogleOAuthTokens', error, { userId: session.user.id })
  }
}
import type { Session } from '@supabase/supabase-js'

function getExpiryTimestamp(session: Session): string | null {
  if (!session.expires_at) {
    return null
  }

  return new Date(session.expires_at * 1000).toISOString()
}

export type OAuthTokenPayload = {
  provider: 'google'
  accessToken: string
  refreshToken: string | null
  expiresAt: string | null
}

export function getOAuthTokenPayload(session: Session | null | undefined): OAuthTokenPayload | null {
  if (!session?.user || session.user.is_anonymous) {
    return null
  }

  const provider = session.user.app_metadata?.provider

  if (provider !== 'google' || !session.provider_token) {
    return null
  }

  return {
    provider: 'google',
    accessToken: session.provider_token,
    refreshToken: session.provider_refresh_token ?? null,
    expiresAt: getExpiryTimestamp(session),
  }
}
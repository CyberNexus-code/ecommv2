import type { Provider, SupabaseClient } from '@supabase/supabase-js'
import { buildAuthCallbackUrl, sanitizeNextPath } from '@/lib/auth/paths'
import { rememberPendingGuestMerge } from '@/lib/auth/pendingGuestMerge'

export type SupportedOAuthProvider = 'google' | 'facebook'

const OAUTH_PROVIDER_CONFIG: Record<SupportedOAuthProvider, { label: string; queryParams?: Record<string, string> }> = {
  google: {
    label: 'Google',
    queryParams: {
      access_type: 'offline',
      prompt: 'select_account consent',
    },
  },
  facebook: {
    label: 'Facebook',
  },
}

export function getOAuthProviderLabel(provider: SupportedOAuthProvider) {
  return OAUTH_PROVIDER_CONFIG[provider].label
}

export async function startOAuthSignIn({
  supabase,
  provider,
  next,
}: {
  supabase: SupabaseClient
  provider: SupportedOAuthProvider
  next: string | null | undefined
}) {
  const safeNext = sanitizeNextPath(next)
  const { data: current } = await supabase.auth.getSession()

  if (current.session?.user) {
    if (current.session.user.is_anonymous) {
      rememberPendingGuestMerge(current.session.user.id)
    }

    const { error: signOutError } = await supabase.auth.signOut()

    if (signOutError) {
      return { error: signOutError }
    }
  }

  return supabase.auth.signInWithOAuth({
    provider: provider as Provider,
    options: {
      redirectTo: buildAuthCallbackUrl(window.location.origin, safeNext),
      queryParams: OAUTH_PROVIDER_CONFIG[provider].queryParams,
    },
  })
}
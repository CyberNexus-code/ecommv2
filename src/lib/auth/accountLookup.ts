import 'server-only'

import { logServerError } from '@/lib/logging/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type AccountLoginMethod = 'google' | 'password' | 'unknown'

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export async function hasRegisteredAccountEmail(email: string, excludeProfileId?: string) {
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail) {
    return false
  }

  const admin = createAdminClient()
  let query = admin
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('email', normalizedEmail)
    .in('role', ['client', 'admin'])
    .eq('is_deleted', false)

  if (excludeProfileId) {
    query = query.neq('id', excludeProfileId)
  }

  const { count, error } = await query

  if (error) {
    await logServerError('auth.accountLookup.hasRegisteredAccountEmail', error, { excludeProfileId })
    return false
  }

  return (count ?? 0) > 0
}

export async function getAccountLoginMethod(email: string): Promise<AccountLoginMethod> {
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail) {
    return 'unknown'
  }

  const admin = createAdminClient()
  const { data: profiles, error: profilesError } = await admin
    .from('profiles')
    .select('id')
    .eq('email', normalizedEmail)
    .in('role', ['client', 'admin'])
    .eq('is_deleted', false)

  if (profilesError) {
    await logServerError('auth.accountLookup.getAccountLoginMethod.profiles', profilesError)
    return 'unknown'
  }

  const userIds = (profiles ?? []).map((profile) => profile.id)

  if (userIds.length === 0) {
    return 'unknown'
  }

  const { data: providerRows, error: providerError } = await admin
    .from('oauth_provider_tokens')
    .select('user_id, provider')
    .in('user_id', userIds)
    .eq('provider', 'google')
    .limit(1)

  if (providerError) {
    await logServerError('auth.accountLookup.getAccountLoginMethod.oauthTokens', providerError)
    return 'unknown'
  }

  if ((providerRows ?? []).length > 0) {
    return 'google'
  }

  return 'password'
}
import 'server-only'

import { logServerError } from '@/lib/logging/server'
import { createAdminClient } from '@/lib/supabase/admin'

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
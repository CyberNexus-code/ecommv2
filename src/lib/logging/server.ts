import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import { errorToLogMessage, normalizeLogEntry } from '@/lib/logging/shared'
import type { AppLogEntry } from '@/types/logging'

export async function logServerEvent(entry: AppLogEntry) {
  const admin = createAdminClient()
  const payload = normalizeLogEntry(entry)

  try {
    await admin.from('app_logs').insert({
      level: payload.level,
      source: payload.source,
      message: payload.message,
      path: payload.path ?? null,
      user_id: payload.userId ?? null,
      metadata: payload.metadata ?? {},
    })
  } catch {
    // Never throw from logging paths.
  }
}

export async function logServerError(source: string, error: unknown, metadata?: Record<string, unknown>) {
  const normalized = errorToLogMessage(error)

  await logServerEvent({
    level: 'error',
    source,
    message: normalized.message,
    metadata: {
      ...(normalized.metadata ?? {}),
      ...(metadata ?? {}),
    },
  })
}

export async function logServerWarning(source: string, message: string, metadata?: Record<string, unknown>) {
  await logServerEvent({
    level: 'warn',
    source,
    message,
    metadata,
  })
}
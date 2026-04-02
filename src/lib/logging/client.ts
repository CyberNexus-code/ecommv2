'use client'

import { errorToLogMessage, normalizeLogEntry } from '@/lib/logging/shared'
import type { AppLogEntry } from '@/types/logging'

export async function logClientEvent(entry: AppLogEntry) {
  const payload = normalizeLogEntry(entry)

  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
    })
  } catch {
    // Never throw from client logging paths.
  }
}

export function logClientError(source: string, error: unknown, metadata?: Record<string, unknown>) {
  const normalized = errorToLogMessage(error)

  return logClientEvent({
    level: 'error',
    source,
    message: normalized.message,
    metadata: {
      ...(normalized.metadata ?? {}),
      ...(metadata ?? {}),
    },
  })
}
import type { AppLogEntry, AppLogLevel } from '@/types/logging'

const VALID_LEVELS: AppLogLevel[] = ['info', 'warn', 'error']

function truncate(value: string, limit: number) {
  return value.length > limit ? `${value.slice(0, limit)}...` : value
}

function sanitizeMetadata(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }

  try {
    return JSON.parse(JSON.stringify(value)) as Record<string, unknown>
  } catch {
    return {}
  }
}

export function normalizeLogEntry(entry: AppLogEntry): AppLogEntry {
  return {
    level: VALID_LEVELS.includes(entry.level) ? entry.level : 'error',
    source: truncate(entry.source || 'unknown', 120),
    message: truncate(entry.message || 'Unknown log message', 2000),
    path: entry.path ? truncate(entry.path, 500) : null,
    userId: entry.userId ?? null,
    metadata: sanitizeMetadata(entry.metadata),
  }
}

export function errorToLogMessage(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      metadata: {
        name: error.name,
        stack: error.stack,
      },
    }
  }

  return {
    message: typeof error === 'string' ? error : 'Unknown error',
    metadata: {
      raw: typeof error === 'string' ? error : String(error),
    },
  }
}
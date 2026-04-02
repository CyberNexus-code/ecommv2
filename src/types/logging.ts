export type AppLogLevel = 'info' | 'warn' | 'error'

export type AppLogEntry = {
  level: AppLogLevel
  source: string
  message: string
  path?: string | null
  userId?: string | null
  metadata?: Record<string, unknown>
}
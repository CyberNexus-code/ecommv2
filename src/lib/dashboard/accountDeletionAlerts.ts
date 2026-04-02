import { createServer } from '@/lib/supabase/server'
import { logServerError } from '@/lib/logging/server'

type AccountDeletionAlertRow = {
  id: number
  message: string
  metadata: {
    deletedUserId?: string
    activeOrderCount?: number
    activeOrders?: Array<{
      orderNumber?: number
      status?: string
    }>
  } | null
  created_at: string
}

export type AccountDeletionAlert = {
  id: number
  message: string
  deletedUserId: string | null
  activeOrderCount: number
  activeOrders: Array<{
    orderNumber: number | null
    status: string | null
  }>
  createdAt: string
}

export type AccountDeletionAlertSummary = {
  recentCount: number
  recentAlerts: AccountDeletionAlert[]
}

export async function getAccountDeletionAlertSummary(): Promise<AccountDeletionAlertSummary> {
  const supabase = await createServer()
  const since = new Date()
  since.setDate(since.getDate() - 14)

  const [countResult, alertsResult] = await Promise.all([
    supabase
      .from('app_logs')
      .select('id', { count: 'exact', head: true })
      .eq('source', 'authActions.deleteOwnAccount.activeOrders')
      .gte('created_at', since.toISOString()),
    supabase
      .from('app_logs')
      .select('id, message, metadata, created_at')
      .eq('source', 'authActions.deleteOwnAccount.activeOrders')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  if (countResult.error) {
    await logServerError('dashboard.accountDeletionAlerts.count', countResult.error)
  }

  if (alertsResult.error) {
    await logServerError('dashboard.accountDeletionAlerts.list', alertsResult.error)
  }

  const recentAlerts = ((alertsResult.data ?? []) as AccountDeletionAlertRow[]).map((alert) => ({
    id: alert.id,
    message: alert.message,
    deletedUserId: alert.metadata?.deletedUserId ?? null,
    activeOrderCount: Number(alert.metadata?.activeOrderCount ?? 0),
    activeOrders: (alert.metadata?.activeOrders ?? []).map((order) => ({
      orderNumber: typeof order.orderNumber === 'number' ? order.orderNumber : null,
      status: order.status ?? null,
    })),
    createdAt: alert.created_at,
  }))

  return {
    recentCount: countResult.count ?? 0,
    recentAlerts,
  }
}
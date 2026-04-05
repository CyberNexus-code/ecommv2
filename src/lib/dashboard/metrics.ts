import { createServer } from '@/lib/supabase/server'
import { logServerError } from '@/lib/logging/server'

type MetricPoint = {
  label: string
  value: number
}

type DashboardOrderRow = {
  id: string
  total: number | string | null
  status: string
  created_at: string
}

type DashboardItemRow = {
  id: string
  category_id: string | null
  is_active: boolean
  is_deleted: boolean
  categories: { name: string } | null
  items_tags?: { tag_id: string }[] | null
}

export type DashboardMetrics = {
  totals: {
    revenue: number
    orderCount: number
    averageOrderValue: number
    pendingOrders: number
    activeProducts: number
    untaggedProducts: number
  }
  revenueSeries: MetricPoint[]
  orderStatusSeries: MetricPoint[]
  categorySeries: MetricPoint[]
}

const ACTIVE_ORDER_STATUSES = new Set([
  'order_placed_pending_payment',
  'order_placed_payment_received',
  'order_shipped',
  'completed',
  'suspended_pending_payment',
])

const PENDING_ORDER_STATUSES = new Set([
  'order_placed_pending_payment',
  'order_placed_payment_received',
  'suspended_pending_payment',
])

function formatDayLabel(date: Date) {
  return date.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createServer()

  const [ordersResult, itemsResult] = await Promise.all([
    supabase
      .from('orders')
      .select('id, total, status, created_at')
      .eq('is_deleted', false),
    supabase
      .from('items')
      .select('id, category_id, is_active, is_deleted, categories(name), items_tags(tag_id)')
      .eq('is_deleted', false),
  ])

  if (ordersResult.error) {
    await logServerError('dashboard.metrics.orders', ordersResult.error)
  }

  if (itemsResult.error) {
    await logServerError('dashboard.metrics.items', itemsResult.error)
  }

  const orders = (ordersResult.data ?? []) as DashboardOrderRow[]
  const items = (itemsResult.data ?? []) as unknown as DashboardItemRow[]
  const activeItems = items.filter((item) => item.is_active && !item.is_deleted)
  const activeOrders = orders.filter((order) => ACTIVE_ORDER_STATUSES.has(order.status))

  const revenue = activeOrders.reduce((sum, order) => sum + Number(order.total ?? 0), 0)
  const orderCount = activeOrders.length
  const averageOrderValue = orderCount > 0 ? revenue / orderCount : 0
  const pendingOrders = activeOrders.filter((order) => PENDING_ORDER_STATUSES.has(order.status)).length
  const untaggedProducts = activeItems.filter((item) => (item.items_tags?.length ?? 0) === 0).length

  const today = new Date()
  const revenueSeries = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (13 - index))
    const key = date.toISOString().slice(0, 10)

    const dailyRevenue = activeOrders
      .filter((order) => order.created_at?.slice(0, 10) === key)
      .reduce((sum, order) => sum + Number(order.total ?? 0), 0)

    return {
      label: formatDayLabel(date),
      value: Number(dailyRevenue.toFixed(2)),
    }
  })

  const statusMap = new Map<string, number>()
  activeOrders.forEach((order) => {
    statusMap.set(order.status, (statusMap.get(order.status) ?? 0) + 1)
  })

  const orderStatusSeries = Array.from(statusMap.entries()).map(([label, value]) => ({ label, value }))

  const categoryMap = new Map<string, number>()
  activeItems.forEach((item) => {
    const label = item.categories?.name ?? 'uncategorized'
    categoryMap.set(label, (categoryMap.get(label) ?? 0) + 1)
  })

  const categorySeries = Array.from(categoryMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 6)

  return {
    totals: {
      revenue: Number(revenue.toFixed(2)),
      orderCount,
      averageOrderValue: Number(averageOrderValue.toFixed(2)),
      pendingOrders,
      activeProducts: activeItems.length,
      untaggedProducts,
    },
    revenueSeries,
    orderStatusSeries,
    categorySeries,
  }
}
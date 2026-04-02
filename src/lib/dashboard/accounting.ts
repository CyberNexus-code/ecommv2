import { createServer } from '@/lib/supabase/server'
import { logServerError } from '@/lib/logging/server'
import type { InvoicePayload } from '@/lib/orders/invoice'
import type { BusinessSettings } from '@/types/businessSettings'

type AccountingOrderRow = {
  id: string
  order_number: number | string
  status: string
  total: number | string | null
  created_at: string
  customer_name: string | null
  customer_email: string | null
  delivery_address: string | null
  delivery_city: string | null
  delivery_postal_code: number | string | null
  order_items: {
    id?: string | null
    item_name: string | null
    quantity: number | string | null
    unit_price: number | string | null
    line_total: number | string | null
  }[]
}

export type AccountingOrder = Omit<InvoicePayload, 'businessSettings'>

async function requireAdminSupabase() {
  const supabase = await createServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: profile, error } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (error || profile?.role !== 'admin') {
    throw new Error('Forbidden')
  }

  return supabase
}

function mapOrder(row: AccountingOrderRow): AccountingOrder {
  const customerEmail = row.customer_email ?? ''

  return {
    orderId: row.id,
    orderNumber: Number(row.order_number),
    status: row.status,
    total: Number(row.total ?? 0),
    createdAt: row.created_at,
    customerEmail,
    customerName: row.customer_name ?? customerEmail,
    deliveryAddress: row.delivery_address ?? '',
    deliveryCity: row.delivery_city ?? '',
    deliveryPostalCode: String(row.delivery_postal_code ?? ''),
    items: (row.order_items ?? []).map((item) => ({
      item_name: item.item_name,
      quantity: Number(item.quantity ?? 0),
      unit_price: Number(item.unit_price ?? 0),
      line_total: Number(item.line_total ?? 0),
    })),
  }
}

export async function getAccountingOrders(): Promise<AccountingOrder[]> {
  try {
    const supabase = await requireAdminSupabase()
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, status, total, created_at, customer_name, customer_email, delivery_address, delivery_city, delivery_postal_code, order_items(id, item_name, quantity, unit_price, line_total)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return ((data ?? []) as AccountingOrderRow[]).map(mapOrder)
  } catch (error) {
    await logServerError('accounting.getAccountingOrders', error)
    return []
  }
}

export async function getAccountingOrderById(orderId: string): Promise<AccountingOrder | null> {
  try {
    const supabase = await requireAdminSupabase()
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, status, total, created_at, customer_name, customer_email, delivery_address, delivery_city, delivery_postal_code, order_items(id, item_name, quantity, unit_price, line_total)')
      .eq('id', orderId)
      .maybeSingle<AccountingOrderRow>()

    if (error) {
      throw error
    }

    return data ? mapOrder(data) : null
  } catch (error) {
    await logServerError('accounting.getAccountingOrderById', error, { orderId })
    return null
  }
}

export function buildAccountingCsv(orders: AccountingOrder[], settings: BusinessSettings): string {
  const header = [
    'invoice_number',
    'order_id',
    'created_at',
    'customer_name',
    'customer_email',
    'status',
    'total',
    'delivery_address',
    'delivery_city',
    'delivery_postal_code',
    'payment_reference_prefix',
  ]

  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`

  const rows = orders.map((order) => [
    String(order.orderNumber),
    order.orderId,
    order.createdAt,
    order.customerName,
    order.customerEmail,
    order.status,
    order.total.toFixed(2),
    order.deliveryAddress,
    order.deliveryCity,
    order.deliveryPostalCode,
    settings.payment_reference_prefix,
  ].map((value) => escape(String(value ?? ''))).join(','))

  return [header.join(','), ...rows].join('\n')
}

export function buildAccountingLineItemsCsv(orders: AccountingOrder[], settings: BusinessSettings): string {
  const header = [
    'invoice_number',
    'order_id',
    'created_at',
    'customer_name',
    'customer_email',
    'status',
    'item_name',
    'quantity',
    'unit_price',
    'line_total',
    'payment_reference_prefix',
  ]

  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`

  const rows = orders.flatMap((order) =>
    order.items.map((item) => [
      String(order.orderNumber),
      order.orderId,
      order.createdAt,
      order.customerName,
      order.customerEmail,
      order.status,
      item.item_name ?? 'Item',
      String(item.quantity),
      item.unit_price.toFixed(2),
      item.line_total.toFixed(2),
      settings.payment_reference_prefix,
    ].map((value) => escape(String(value ?? ''))).join(','))
  )

  return [header.join(','), ...rows].join('\n')
}
import { NextResponse } from 'next/server'
import { getBusinessSettings } from '@/lib/businessSettings'
import { buildAccountingLineItemsCsv, getAccountingOrders } from '@/lib/dashboard/accounting'
import { getUserRole } from '@/lib/getuserRole'

export async function GET() {
  const role = await getUserRole()

  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [orders, settings] = await Promise.all([
    getAccountingOrders(),
    getBusinessSettings(),
  ])

  const csv = buildAccountingLineItemsCsv(orders, settings)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="accounting-line-items-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
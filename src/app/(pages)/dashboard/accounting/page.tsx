export const dynamic = 'force-dynamic'

import Link from 'next/link'
import BankingDetailsForm from '@/components/dashboard/accounting/BankingDetailsForm'
import { getBusinessSettings } from '@/lib/businessSettings'
import { getAccountingOrders } from '@/lib/dashboard/accounting'
import { formatCurrency } from '@/lib/orders/invoice'

export default async function AccountingPage() {
  const [settings, orders] = await Promise.all([
    getBusinessSettings(),
    getAccountingOrders(),
  ])

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const pendingCount = orders.filter((order) => order.status === 'order_placed_pending_payment' || order.status === 'suspended_pending_payment').length
  const outstandingTotal = orders
    .filter((order) => order.status === 'order_placed_pending_payment' || order.status === 'suspended_pending_payment')
    .reduce((sum, order) => sum + order.total, 0)
  const paidTotal = orders
    .filter((order) => order.status === 'order_placed_payment_received' || order.status === 'order_shipped' || order.status === 'completed')
    .reduce((sum, order) => sum + order.total, 0)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">Accounting</p>
          <h1 className="text-2xl font-semibold text-rose-900">Invoices and Exports</h1>
          <p className="text-sm text-stone-600">Manage banking details, print invoices, and export order records for spreadsheets.</p>
        </div>
        <Link href="/dashboard/accounting/export" className="inline-flex rounded-full bg-rose-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-800">
          Export CSV
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">Invoices</p>
          <p className="mt-2 text-3xl font-semibold text-rose-950">{orders.length}</p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">Revenue</p>
          <p className="mt-2 text-3xl font-semibold text-rose-950">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">Pending Payment</p>
          <p className="mt-2 text-3xl font-semibold text-rose-950">{pendingCount}</p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">Outstanding Value</p>
          <p className="mt-2 text-3xl font-semibold text-rose-950">{formatCurrency(outstandingTotal)}</p>
          <p className="mt-1 text-xs text-stone-500">Paid / processing value: {formatCurrency(paidTotal)}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-rose-900">Export Ready</h2>
          <p className="mt-1 text-sm text-stone-600">Use the order register export for invoice-level reporting and the line-item export for spreadsheet bookkeeping.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/dashboard/accounting/export" className="inline-flex rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50">
              Export Invoice Register
            </Link>
            <Link href="/dashboard/accounting/export/line-items" className="inline-flex rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50">
              Export Line Items
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-rose-900">Payment Reference</h2>
          <p className="mt-1 text-sm text-stone-600">Invoices currently use the prefix below when generating EFT references.</p>
          <p className="mt-4 inline-flex rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
            {settings.payment_reference_prefix}-1234
          </p>
        </section>
      </div>

      <BankingDetailsForm settings={settings} />

      <section className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-rose-900">Invoice Register</h2>
            <p className="text-sm text-stone-600">Recent orders with print-friendly invoice pages.</p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-rose-800">
              <tr className="border-b border-rose-100">
                <th className="px-3 py-2 font-semibold">Invoice</th>
                <th className="px-3 py-2 font-semibold">Customer</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Total</th>
                <th className="px-3 py-2 font-semibold">Issued</th>
                <th className="px-3 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.orderId} className="border-b border-rose-50 last:border-b-0">
                  <td className="px-3 py-3 font-medium text-rose-900">#{order.orderNumber}</td>
                  <td className="px-3 py-3 text-stone-700">
                    <p>{order.customerName || order.customerEmail}</p>
                    <p className="text-xs text-stone-500">{order.customerEmail}</p>
                  </td>
                  <td className="px-3 py-3 text-stone-700">{order.status.replaceAll('_', ' ')}</td>
                  <td className="px-3 py-3 text-stone-700">{formatCurrency(order.total)}</td>
                  <td className="px-3 py-3 text-stone-700">{new Date(order.createdAt).toLocaleDateString('en-ZA')}</td>
                  <td className="px-3 py-3">
                    <Link href={`/dashboard/accounting/invoices/${order.orderId}`} className="inline-flex rounded-full border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50">
                      Open Invoice
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 ? <p className="px-3 py-4 text-sm text-stone-600">No invoice records yet.</p> : null}
        </div>
      </section>
    </div>
  )
}
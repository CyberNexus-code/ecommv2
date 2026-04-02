'use client'

import Link from 'next/link'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DashboardMetrics } from '@/lib/dashboard/metrics'
import { ORDER_STATUS_CONFIG } from '@/lib/dashboard/orders/orderStatus'

type AdminOverviewChartsProps = {
  metrics: DashboardMetrics
}

const PIE_COLORS = ['#be123c', '#fb7185', '#f59e0b', '#14b8a6', '#6366f1', '#94a3b8']

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0,
  }).format(value)
}

function metricTitle(label: string) {
  const status = ORDER_STATUS_CONFIG[label as keyof typeof ORDER_STATUS_CONFIG]
  return status?.text ?? label.replaceAll('_', ' ')
}

export default function AdminOverviewCharts({ metrics }: AdminOverviewChartsProps) {
  const statCards = [
    { label: 'Revenue', value: formatCurrency(metrics.totals.revenue), hint: 'Gross non-cancelled sales', href: '/dashboard/orders' },
    { label: 'Orders', value: String(metrics.totals.orderCount), hint: 'Tracked across all live statuses', href: '/dashboard/orders' },
    { label: 'Average order', value: formatCurrency(metrics.totals.averageOrderValue), hint: 'Revenue divided by active orders', href: '/dashboard/orders' },
    { label: 'Pending action', value: String(metrics.totals.pendingOrders), hint: 'Orders awaiting payment or fulfillment', href: '/dashboard/orders' },
    { label: 'Active products', value: String(metrics.totals.activeProducts), hint: 'Visible catalog items', href: '/dashboard/products' },
    { label: 'Untagged products', value: String(metrics.totals.untaggedProducts), hint: 'Products still missing filter metadata', href: '/dashboard/products' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-rose-950">{card.value}</p>
            <p className="mt-2 text-sm text-stone-600">{card.hint}</p>
            <p className="mt-4 text-sm font-medium text-rose-600">Open details</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">Revenue Trend</p>
            <h2 className="mt-1 text-xl font-semibold text-rose-900">Last 14 days</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.revenueSeries}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f5d0d8" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#7f1d1d', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#7f1d1d', fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                <Area type="monotone" dataKey="value" stroke="#be123c" strokeWidth={3} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">Order Mix</p>
            <h2 className="mt-1 text-xl font-semibold text-rose-900">Status distribution</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={metrics.orderStatusSeries} dataKey="value" nameKey="label" innerRadius={65} outerRadius={95} paddingAngle={3}>
                  {metrics.orderStatusSeries.map((entry, index) => (
                    <Cell key={entry.label} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [Number(value ?? 0), metricTitle(String(name))]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid gap-2">
            {metrics.orderStatusSeries.map((entry, index) => (
              <div key={entry.label} className="flex items-center justify-between rounded-xl bg-rose-50 px-3 py-2 text-sm">
                <div className="flex items-center gap-2 text-rose-900">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                  {metricTitle(entry.label)}
                </div>
                <span className="font-semibold text-rose-700">{entry.value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">Catalog Spread</p>
          <h2 className="mt-1 text-xl font-semibold text-rose-900">Products by category</h2>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.categorySeries}>
              <CartesianGrid stroke="#f5d0d8" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#7f1d1d', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#7f1d1d', fontSize: 12 }} allowDecimals={false} />
              <Tooltip formatter={(value) => [Number(value ?? 0), 'Products']} />
              <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#fb7185" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}
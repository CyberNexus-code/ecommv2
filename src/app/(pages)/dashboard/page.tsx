import AdminOverviewCharts from "@/components/dashboard/AdminOverviewCharts";
import { getAccountDeletionAlertSummary } from "@/lib/dashboard/accountDeletionAlerts";
import { getDashboardMetrics } from "@/lib/dashboard/metrics";

export default async function DashboardPage() {
  const [metrics, deletionAlerts] = await Promise.all([
    getDashboardMetrics(),
    getAccountDeletionAlertSummary(),
  ]);

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-500">Admin Overview</p>
          <h1 className="mt-1 text-2xl font-semibold text-rose-900 md:text-3xl">Welcome back</h1>
          <p className="mt-2 text-sm text-stone-600 md:text-base">
            Keep a close eye on revenue, fulfillment pressure, and catalog health from one place.
          </p>
        </div>

        <section className="rounded-2xl border border-amber-200 bg-[linear-gradient(135deg,rgba(255,251,235,0.95),rgba(255,255,255,0.98))] p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-600">Account Deletion Alerts</p>
              <h2 className="mt-1 text-xl font-semibold text-amber-950">Deletion requests with active orders</h2>
              <p className="mt-2 max-w-3xl text-sm text-stone-700">
                These requests removed account access while keeping order-level contact and delivery snapshots available for fulfilment, support, and record retention.
              </p>
            </div>
            <div className="rounded-full border border-amber-300 bg-white px-3 py-1 text-sm font-medium text-amber-800">
              {deletionAlerts.recentCount} in the last 14 days
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {deletionAlerts.recentAlerts.length > 0 ? deletionAlerts.recentAlerts.map((alert) => (
              <article key={alert.id} className="rounded-2xl border border-amber-100 bg-white/90 p-4">
                <p className="text-sm font-medium text-amber-900">{alert.activeOrderCount} active order{alert.activeOrderCount === 1 ? '' : 's'} at deletion</p>
                <p className="mt-1 text-xs text-stone-500">{new Date(alert.createdAt).toLocaleString('en-ZA')}</p>
                <p className="mt-3 text-sm text-stone-700">{alert.message}</p>
                <p className="mt-3 text-xs text-stone-500">User: {alert.deletedUserId ?? 'unknown'}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {alert.activeOrders.map((order) => (
                    <span key={`${alert.id}-${order.orderNumber ?? 'unknown'}-${order.status ?? 'unknown'}`} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-800">
                      #{order.orderNumber ?? 'unknown'} {order.status ?? 'unknown'}
                    </span>
                  ))}
                </div>
              </article>
            )) : (
              <p className="rounded-2xl border border-amber-100 bg-white/90 p-4 text-sm text-stone-700 md:col-span-2 xl:col-span-3">
                No account deletions with active orders have been logged in the last 14 days.
              </p>
            )}
          </div>
        </section>

        <AdminOverviewCharts metrics={metrics} />
      </div>
    );
  }

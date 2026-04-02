import AdminOverviewCharts from "@/components/dashboard/AdminOverviewCharts";
import { getDashboardMetrics } from "@/lib/dashboard/metrics";

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-500">Admin Overview</p>
          <h1 className="mt-1 text-2xl font-semibold text-rose-900 md:text-3xl">Welcome back</h1>
          <p className="mt-2 text-sm text-stone-600 md:text-base">
            Keep a close eye on revenue, fulfillment pressure, and catalog health from one place.
          </p>
        </div>

        <AdminOverviewCharts metrics={metrics} />
      </div>
    );
  }

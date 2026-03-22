import Link from "next/link";
import { getMyOrders } from "@/lib/orders/getMyOrders";
import { ORDER_STATUS_CONFIG } from "@/lib/dashboard/orders/orderStatus";

export const dynamic = "force-dynamic";

export default async function AccountOrdersPage() {
  const orders = await getMyOrders();

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">
          Account
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-rose-900">My Orders</h1>
        <p className="mt-1 text-sm text-stone-600">
          Track your placed orders and latest fulfillment status.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm">
          <p className="text-lg font-semibold text-rose-800">No orders yet.</p>
          <p className="mt-1 text-sm text-stone-600">
            When you place an order, it will appear here.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-flex rounded-md bg-rose-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-800"
          >
            Shop Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG];
            const statusText = status?.text ?? order.status;
            const statusBg = status?.bg ?? "bg-stone-400";
            const statusTc = status?.tc ?? "text-white";

            return (
              <article
                key={order.id}
                className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-rose-100 pb-3">
                  <div>
                    <p className="text-lg font-semibold text-rose-900">
                      Order #{order.order_number}
                    </p>
                    <p className="text-sm text-stone-600">
                      {order.created_at.replace("T", " ").split(".")[0]}
                    </p>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBg} ${statusTc}`}>
                    {statusText}
                  </div>
                </div>

                <div className="space-y-2">
                  {order.order_items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg bg-rose-50 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-rose-900">
                          {item.item_name ?? "Item"}
                        </p>
                        <p className="text-xs text-stone-600">
                          Qty: {item.quantity} x R {Number(item.unit_price).toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-rose-700">
                        R {Number(item.line_total).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-end border-t border-rose-100 pt-3">
                  <p className="text-base font-semibold text-rose-800">
                    Total: R {Number(order.total).toFixed(2)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}


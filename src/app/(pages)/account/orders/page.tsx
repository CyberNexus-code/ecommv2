import Link from "next/link";
import { getMyOrders } from "@/lib/orders/getMyOrders";
import { ORDER_STATUS_CONFIG } from "@/lib/dashboard/orders/orderStatus";
import { getUserWithProfile } from "@/lib/profiles/profiles";
import { getBusinessSettings } from "@/lib/businessSettings";
import { formatSastDateTime } from "@/lib/dateTime";
import { getInvoiceReferenceFromOrderNumber } from "@/lib/orders/reference";

export const dynamic = "force-dynamic";

export default async function AccountOrdersPage() {
  const { user } = await getUserWithProfile();
  const [orders, settings] = await Promise.all([getMyOrders(), getBusinessSettings()]);
  const isGuestUser = !!user?.is_anonymous;

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
        {isGuestUser ? (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            These orders belong to your current guest session. Sign in or create an account from this browser to merge them into a permanent account.
          </p>
        ) : null}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm">
          <p className="text-lg font-semibold text-rose-800">No orders yet.</p>
          <p className="mt-1 text-sm text-stone-600">
            {isGuestUser
              ? "When you place an order as a guest in this session, it will appear here."
              : "When you place an order, it will appear here."}
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
                      {getInvoiceReferenceFromOrderNumber(order.order_number, settings.payment_reference_prefix)}
                    </p>
                    <p className="text-sm text-stone-600">
                      {formatSastDateTime(order.created_at)}
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
                  <div className="text-right text-sm text-stone-600">
                    <p>Items subtotal: R {Number(order.subtotal).toFixed(2)}</p>
                    <p>Delivery: R {Number(order.delivery_fee).toFixed(2)}</p>
                    <p className="text-base font-semibold text-rose-800">
                      Total: R {Number(order.total).toFixed(2)}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}


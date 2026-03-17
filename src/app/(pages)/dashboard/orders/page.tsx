export const dynamic = "force-dynamic"

import OrderListContianer from "@/components/dashboard/orders/orderlistcontainer";
import { getOrders } from "@/lib/dashboard/orders/orders";

export default async function clientOrders(){
    const orders = await getOrders();
    const now = Date.now();
    const activeOrders = orders?.filter(order => (order.status !== "completed") && (order.status !== "cancelled")) ?? [];
    const closedOrders = orders?.filter(order => (order.status === "completed") || (order.status === "cancelled")) ?? [];
    
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">Fulfillment</p>
                    <h1 className="text-2xl font-semibold text-rose-900">Orders</h1>
                    <p className="text-sm text-stone-600">Review active orders and track completed ones.</p>
                </div>
                <div className="rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700">
                    {orders?.length ?? 0} total
                </div>
            </div>
            <div>
              {orders ? 
              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
                    <h2 className="mb-2 text-lg font-semibold text-rose-900">Active Orders</h2>
                    <p className="mb-3 text-sm text-stone-600">Awaiting payment, processing, or shipping.</p>
                    {activeOrders.length > 0 ? activeOrders.map(order => (
                        <OrderListContianer key={order.id} order={order} now={now} />
                    )) : <p className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">No active orders right now.</p>}
                </div>
                <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
                    <h2 className="mb-2 text-lg font-semibold text-rose-900">Completed & Cancelled</h2>
                    <p className="mb-3 text-sm text-stone-600">Recently closed order history.</p>
                    {closedOrders.length > 0 ? closedOrders.map(order => (
                        <OrderListContianer key={order.id} order={order} now={now} />
                    )) : <p className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">No closed orders yet.</p>}
                </div>
            </div>
              :
               <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
                <p className="text-lg font-semibold text-rose-800">No orders found!</p>
                </div>}
            </div>
        </div>
    )
}

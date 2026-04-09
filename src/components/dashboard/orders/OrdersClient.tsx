"use client";

import { useState } from "react";
import OrderListContianer from "@/components/dashboard/orders/orderlistcontainer";
import type { Order } from "@/types/order";

export default function OrdersClient({ orders, referencePrefix }: { orders: Order[]; referencePrefix: string }) {
  const now = Date.now();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const filteredOrders = (orders ?? []).filter(order => {
    const matchesSearch =
      search === "" ||
      order.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
      String(order.order_number).includes(search);
    const matchesStatus = statusFilter === "" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const activeOrders = filteredOrders.filter(order => order.status !== "completed" && order.status !== "cancelled");
  const closedOrders = filteredOrders.filter(order => order.status === "completed" || order.status === "cancelled");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">Fulfillment</p>
          <h1 className="text-2xl font-semibold text-rose-900">Orders</h1>
          <p className="text-sm text-stone-600">Review active orders and track completed ones.</p>
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search by name, email, or order #"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="rounded border border-rose-200 px-2 py-1 text-sm focus:border-rose-400"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded border border-rose-200 px-2 py-1 text-sm focus:border-rose-400"
          >
            <option value="">All Statuses</option>
            <option value="order_placed_pending_payment">Pending Payment</option>
            <option value="order_placed_payment_received">Payment Received</option>
            <option value="order_shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="suspended_pending_payment">Suspended</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700">
            {filteredOrders.length} shown
          </div>
        </div>
      </div>
      <div>
        {filteredOrders.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
              <h2 className="mb-2 text-lg font-semibold text-rose-900">Active Orders</h2>
              <p className="mb-3 text-sm text-stone-600">Awaiting payment, processing, or shipping.</p>
              {activeOrders.length > 0 ? (
                activeOrders.map(order => (
                  <OrderListContianer key={order.id} order={order} now={now} referencePrefix={referencePrefix} />
                ))
              ) : (
                <p className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">No active orders right now.</p>
              )}
            </div>
            <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
              <h2 className="mb-2 text-lg font-semibold text-rose-900">Completed & Cancelled</h2>
              <p className="mb-3 text-sm text-stone-600">Recently closed order history.</p>
              {closedOrders.length > 0 ? (
                closedOrders.map(order => (
                  <OrderListContianer key={order.id} order={order} now={now} referencePrefix={referencePrefix} />
                ))
              ) : (
                <p className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">No closed orders yet.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-rose-800">No orders found!</p>
          </div>
        )}
      </div>
    </div>
  );
}

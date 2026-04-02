import { createServer } from "@/lib/supabase/server";
import { logServerError } from "@/lib/logging/server";
import { ORDER_STATUS_CONFIG, type OrderStatus } from "@/lib/dashboard/orders/orderStatus";

const ACTIVE_ACCOUNT_DELETION_ORDER_STATUSES: OrderStatus[] = [
  "order_placed_pending_payment",
  "order_placed_payment_received",
  "order_shipped",
  "suspended_pending_payment",
];

type ActiveDeletionOrderRow = {
  id: string;
  order_number: number | string;
  status: OrderStatus;
};

export type ActiveDeletionOrder = {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  statusLabel: string;
};

export type AccountDeletionOrderSummary = {
  activeOrders: ActiveDeletionOrder[];
  activeOrderCount: number;
  hasActiveOrders: boolean;
};

export async function getAccountDeletionOrderSummary(userId: string): Promise<AccountDeletionOrderSummary> {
  const supabase = await createServer();

  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, status")
    .eq("user_id", userId)
    .in("status", ACTIVE_ACCOUNT_DELETION_ORDER_STATUSES)
    .order("created_at", { ascending: false });

  if (error) {
    await logServerError("orders.getAccountDeletionOrderSummary", error, { userId });

    return {
      activeOrders: [],
      activeOrderCount: 0,
      hasActiveOrders: false,
    };
  }

  const activeOrders = ((data ?? []) as ActiveDeletionOrderRow[]).map((order) => ({
    id: order.id,
    orderNumber: Number(order.order_number),
    status: order.status,
    statusLabel: ORDER_STATUS_CONFIG[order.status]?.text ?? order.status,
  }));

  return {
    activeOrders,
    activeOrderCount: activeOrders.length,
    hasActiveOrders: activeOrders.length > 0,
  };
}
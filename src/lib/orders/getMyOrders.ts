import { createServer } from "@/lib/supabase/server";
import { logServerError } from "@/lib/logging/server";

export type MyOrderItem = {
  id: string;
  item_name: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type MyOrder = {
  id: string;
  order_number: number;
  status: string;
  total: number;
  created_at: string;
  order_items: MyOrderItem[];
};

type MyOrderRow = {
  id: string;
  order_number: number | string;
  status: string;
  total: number | string | null;
  created_at: string;
  order_items: {
    id: string;
    item_name: string | null;
    quantity: number | string | null;
    unit_price: number | string | null;
    line_total: number | string | null;
  }[];
};

export async function getMyOrders(): Promise<MyOrder[]> {
  const supabase = await createServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, status, total, created_at, order_items(id, item_name, quantity, unit_price, line_total)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    await logServerError('orders.getMyOrders', error, { userId: user.id });
    return [];
  }

  return ((data ?? []) as MyOrderRow[]).map((order) => ({
    id: order.id,
    order_number: Number(order.order_number),
    status: order.status,
    total: Number(order.total ?? 0),
    created_at: order.created_at,
    order_items: (order.order_items ?? []).map((item) => ({
      id: item.id,
      item_name: item.item_name,
      quantity: Number(item.quantity ?? 0),
      unit_price: Number(item.unit_price ?? 0),
      line_total: Number(item.line_total ?? 0),
    })),
  }));
}


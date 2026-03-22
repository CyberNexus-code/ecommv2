import { createServer } from "@/lib/supabase/server";

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
    console.error("Error fetching my orders:", error.message);
    return [];
  }

  return (data ?? []) as MyOrder[];
}


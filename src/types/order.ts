import type { OrderStatus } from "@/lib/dashboard/orders/orderStatus"

export type Order = {
  basket_id: string,
  customer_email: string,
  customer_name: string | null,
  created_at: string,
  delivery_address: string | null,
  delivery_city: string | null,
  delivery_postal_code: number | null,
  id: string,
  is_deleted: boolean,
  order_items: {
    created_at: string,
    id: string,
    item_name?: string | null,
    line_total: number,
    order_id: string,
    quantity: number,
    unit_price: number,
    updated_at: string
  }[],
  order_number: number,
  status: OrderStatus,
  total: number,
  updated_at: string,
  user_id: string
}
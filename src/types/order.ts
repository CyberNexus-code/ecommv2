import type { OrderStatus } from "@/lib/dashboard/orders/orderStatus"

export type Order = {
  basket_id: string,
  created_at: string,
  id: string,
  is_deleted: boolean,
  order_items: {
    created_at: string,
    id: string,
    line_total: number,
    order_id: string,
    quantity: number,
    unit_price: number,
    updated_at: string
  },
  order_number: number,
  profiles: {
    email: string
  },
  status: OrderStatus,
  total: number,
  updated_at: string,
  user_id: string
}
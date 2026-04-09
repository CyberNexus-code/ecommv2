export const dynamic = "force-dynamic"


import OrdersClient from "@/components/dashboard/orders/OrdersClient";
import { getBusinessSettings } from "@/lib/businessSettings";
import { getOrders } from "@/lib/dashboard/orders/orders";

export default async function clientOrders() {
  const [orders, settings] = await Promise.all([getOrders(), getBusinessSettings()]);
  return <OrdersClient orders={orders} referencePrefix={settings.payment_reference_prefix} />;
}

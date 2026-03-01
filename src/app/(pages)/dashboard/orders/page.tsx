export const dynamic = "force-dynamic"

import OrderListContianer from "@/components/dashboard/orders/orderlistcontainer";
import { getOrders } from "@/lib/orders/orders";

export default async function clientOrders(){
    const orders = await getOrders();
    
    return (
        <div className="p-5 max-h-9/10 overflow-scroll">
            <div>
             <h2 className="text-lg">Orders:</h2>
            </div>
            <div>
              {orders ? 
              <div>
                <div>
                    {
                        (orders.filter(order => (order.status !== "completed") && (order.status !== "cancelled")).map(order => (
                            <OrderListContianer key={order.id} order={order} />
                        )))
                    }
                </div>
                <div>
                    <h2>Compleded Orders:</h2>
                </div>
                <div>
                    {
                        (orders.filter(order => (order.status === "completed") || (order.status === "cancelled")).map(order => (
                            <OrderListContianer key={order.id} order={order} />
                        )))
                    }
                </div>
            </div>
              :
               <div>
                <p>No orders found!</p>
                </div>}
            </div>
        </div>
    )
}
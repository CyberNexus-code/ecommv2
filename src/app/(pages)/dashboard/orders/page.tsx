import OrderListModal from "@/components/dashboard/orders/orderlsitmodal";
import OrderListContianer from "@/components/dashboard/orders/orderlistcontainer";
import { getOrders } from "@/lib/orders/orders";

export default async function clientOrders(){
    const orders = await getOrders();
    
    return (
        <div className="p-5">
            <div>
             <h1 className="text-lg">Orders</h1>
            </div>
            <div className="max-h-100 overflow-scroll-y">
              {orders ? (orders?.map(order => 
              <OrderListContianer key={order.id} order={order} />
            )) 
              :
               <div>
                <p>No orders found!</p>
                </div>}
            </div>
        </div>
    )
}
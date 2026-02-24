import OrderListModal from "@/components/dashboard/orderlsitmodal";
import { getOrders } from "@/lib/orders/orders";

export default async function clientOrders(){
    const orders = await getOrders();
    
    console.log("Order baskets:", orders)
    return (
        <div className="p-5">
            <div>
             <h1 className="text-lg">Orders</h1>
            </div>
            <div>
              {orders ? (orders?.map(order => 
              <div key={order.id} className="flex justify-between gap-2 p-2 my-4 bg-white rounded-lg shadow-sm">
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2">
                    <h2>{`# ${order.order_number}`}</h2>
                    <p>User: {order.profiles.email}</p>
                  </div>
                    <p>{order.created_at}</p>
                  <div>
                    <p>Total: R {order.total}</p>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <p className="text-xs">Status</p>
                  <div className="text-xs bg-green-200 py-1 px-2 rounded-full">
                    {order.status}
                  </div>
                </div>
                <div>
                  <button>manage</button>
                </div>
              </div>
            )) 
              :
               <div>
                <p>No orders found!</p>
                </div>}
            </div>
        </div>
    )
}
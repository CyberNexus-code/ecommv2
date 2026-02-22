import OrderListModal from "@/components/dashboard/orderlsitmodal";
import { getOrders } from "@/lib/supabase/orders";

export default async function clientOrders(){
    const baskets = await getOrders();
    
    console.log("Order baskets:", baskets)
    return (
        <div className="p-5">
            <div>
             <h1 className="text-lg">Orders</h1>
            </div>
            <div>
              {baskets ? (baskets?.map(basket => 
              <div key={basket.id}>
                <div className="flex">
                  <h2>{basket.id}</h2>
                  <p>{basket.order_placed_at}</p>
                </div>
                <div>
                    {basket.basket_items.map((item: any) => <p>{item.items.name}</p>)}
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
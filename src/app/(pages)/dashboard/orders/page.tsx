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
                List here
            </div>
        </div>
    )
}
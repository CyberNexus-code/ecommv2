import { revalidatePath } from "next/cache";
import { createServer } from "../../supabase/server";

export async function getOrders(){

    console.log("Calling get orders")

    try{
        const supabase = await createServer()

        const {data: {user}, error: userError} = await supabase.auth.getUser();
        
        if(!user) return;
        
        const {data: profile, error: roleError } = await supabase.from('profiles').select('role').eq('id', user.id).single()

        if(profile?.role === "admin"){
           const {data: orders, error: errorBaskets} = await supabase.from('orders').select('*, order_items(*), profiles(email)')

           if(errorBaskets){
            console.log("Error getting orders:", errorBaskets)
            return
           }
           return orders
        }

    }catch(error){
        console.log(error)
    }
}


export async function updateOrderStatus(orderID: string, newStatus: string){
    
    try{
        const supabase = await createServer();

        const { error } = await supabase.from('orders').update({status: newStatus}).eq('id', orderID);

        if(error){
            throw new Error(error.message)
        }

        revalidatePath("/dashboard/orders")
        return {success: "success"}

    }catch(error){
        console.error(error)
    }
}


export async function cancelOrder(orderID: string, cancelledBy: string){
    try{
        const supabase = await createServer();

        const { error } = await supabase.from('orders').update({status: 'cancelled', cancelled_by: cancelledBy}).eq('id', orderID)

        if(error){
            throw new Error(error.message)
        }

        revalidatePath("/dashboard/orders")
        return {success: "success"};
        
    }catch(error){
        console.error(error)
    }
}
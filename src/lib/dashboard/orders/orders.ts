import { revalidatePath } from "next/cache";
import { createServer } from "../../supabase/server";
import { sendOrderStatusUpdateEmail } from "@/lib/email/sendOrderEmail";

export async function getOrders(){

    console.log("Calling get orders")

    try{
        const supabase = await createServer()

        const {data: {user}} = await supabase.auth.getUser();
        
        if(!user) return;
        
        const {data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

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

        const { data: currentOrder, error: currentOrderError } = await supabase
            .from("orders")
            .select("id, order_number, status, total, created_at, profiles(email), order_items(item_name, quantity, unit_price, line_total)")
            .eq("id", orderID)
            .single();

        if(currentOrderError){
            throw new Error(currentOrderError.message);
        }

        const previousStatus = currentOrder.status;

        if(previousStatus === newStatus){
            return {success: "success"};
        }

        const { error } = await supabase.from('orders').update({status: newStatus}).eq('id', orderID);

        if(error){
            throw new Error(error.message)
        }

        try{
            const customerEmail = currentOrder?.profiles?.email;
            if(customerEmail){
                await sendOrderStatusUpdateEmail({
                    previousStatus,
                    orderId: currentOrder.id,
                    orderNumber: currentOrder.order_number,
                    status: newStatus,
                    total: Number(currentOrder.total ?? 0),
                    createdAt: currentOrder.created_at,
                    customerEmail,
                    items: (currentOrder.order_items ?? []).map((item) => ({
                        item_name: item.item_name,
                        quantity: Number(item.quantity ?? 0),
                        unit_price: Number(item.unit_price ?? 0),
                        line_total: Number(item.line_total ?? 0),
                    })),
                });
            }
        }catch(emailError){
            console.error("Order status updated but email failed:", emailError);
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

        const { data: currentOrder, error: currentOrderError } = await supabase
            .from("orders")
            .select("id, order_number, status, total, created_at, profiles(email), order_items(item_name, quantity, unit_price, line_total)")
            .eq("id", orderID)
            .single();

        if(currentOrderError){
            throw new Error(currentOrderError.message);
        }

        const previousStatus = currentOrder.status;

        const { error } = await supabase.from('orders').update({status: 'cancelled', cancelled_by: cancelledBy}).eq('id', orderID)

        if(error){
            throw new Error(error.message)
        }

        try{
            const customerEmail = currentOrder?.profiles?.email;
            if(customerEmail){
                await sendOrderStatusUpdateEmail({
                    previousStatus,
                    orderId: currentOrder.id,
                    orderNumber: currentOrder.order_number,
                    status: "cancelled",
                    total: Number(currentOrder.total ?? 0),
                    createdAt: currentOrder.created_at,
                    customerEmail,
                    items: (currentOrder.order_items ?? []).map((item) => ({
                        item_name: item.item_name,
                        quantity: Number(item.quantity ?? 0),
                        unit_price: Number(item.unit_price ?? 0),
                        line_total: Number(item.line_total ?? 0),
                    })),
                });
            }
        }catch(emailError){
            console.error("Order cancelled but status email failed:", emailError);
        }

        revalidatePath("/dashboard/orders")
        return {success: "success"};
        
    }catch(error){
        console.error(error)
    }
}

import { revalidatePath } from "next/cache";
import { createServer } from "../../supabase/server";
import { sendOrderStatusUpdateEmail } from "@/lib/email/sendOrderEmail";
import { logServerError } from "@/lib/logging/server";

type OrderEmailRow = {
    id: string
    order_number: number
    status: string
    total: number | string | null
    created_at: string
    profiles: { email?: string | null } | { email?: string | null }[] | null
    order_items: {
        item_name: string | null
        quantity: number | string | null
        unit_price: number | string | null
        line_total: number | string | null
    }[]
}

export async function getOrders(){

    try{
        const supabase = await createServer()

        const {data: {user}} = await supabase.auth.getUser();
        
        if(!user) return;
        
        const {data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

        if(profile?.role === "admin"){
           const {data: orders, error: errorBaskets} = await supabase.from('orders').select('*, order_items(*), profiles(email)')

           if(errorBaskets){
            await logServerError('dashboard.getOrders.fetchOrders', errorBaskets, { userId: user.id })
            return
           }
           return orders
        }

    }catch(error){
        await logServerError('dashboard.getOrders', error)
    }
}


export async function updateOrderStatus(orderID: string, newStatus: string){
    
    try{
        const supabase = await createServer();

        const { data: currentOrder, error: currentOrderError } = await supabase
            .from("orders")
            .select("id, order_number, status, total, created_at, profiles(email), order_items(item_name, quantity, unit_price, line_total)")
            .eq("id", orderID)
            .single<OrderEmailRow>();

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
            const customerEmail = (Array.isArray(currentOrder?.profiles) 
                ? currentOrder.profiles[0]?.email 
                : currentOrder?.profiles?.email);
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
            await logServerError('dashboard.updateOrderStatus.sendOrderStatusUpdateEmail', emailError, { orderID, newStatus });
        }

        revalidatePath("/dashboard/orders")
        return {success: "success"}

    }catch(error){
        await logServerError('dashboard.updateOrderStatus', error, { orderID, newStatus })
    }
}


export async function cancelOrder(orderID: string, cancelledBy: string){
    try{
        const supabase = await createServer();

        const { data: currentOrder, error: currentOrderError } = await supabase
            .from("orders")
            .select("id, order_number, status, total, created_at, profiles(email), order_items(item_name, quantity, unit_price, line_total)")
            .eq("id", orderID)
            .single<OrderEmailRow>();

        if(currentOrderError){
            throw new Error(currentOrderError.message);
        }

        const previousStatus = currentOrder.status;

        const { error } = await supabase.from('orders').update({status: 'cancelled', cancelled_by: cancelledBy}).eq('id', orderID)

        if(error){
            throw new Error(error.message)
        }

        try{
            const customerEmail = (Array.isArray(currentOrder?.profiles) 
                ? currentOrder.profiles[0]?.email 
                : currentOrder?.profiles?.email);
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
            await logServerError('dashboard.cancelOrder.sendOrderStatusUpdateEmail', emailError, { orderID, cancelledBy });
        }

        revalidatePath("/dashboard/orders")
        return {success: "success"};
        
    }catch(error){
        await logServerError('dashboard.cancelOrder', error, { orderID, cancelledBy })
    }
}

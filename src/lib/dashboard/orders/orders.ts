import { revalidatePath } from "next/cache";
import { getBusinessSettings } from "@/lib/businessSettings";
import { createServer } from "../../supabase/server";
import { sendOrderStatusUpdateEmail } from "@/lib/email/sendOrderEmail";
import { logServerError } from "@/lib/logging/server";

type OrderEmailRow = {
    id: string
    order_number: number
    status: string
    subtotal: number | string | null
    delivery_fee: number | string | null
    total: number | string | null
    created_at: string
    customer_name: string | null
    customer_email: string | null
    delivery_address: string | null
    delivery_city: string | null
    delivery_postal_code: number | string | null
    waybill_number: string | null
    order_items: {
        id?: string | null
        item_name: string | null
        quantity: number | string | null
        unit_price: number | string | null
        line_total: number | string | null
    }[]
}

function normalizeWaybillNumber(value?: string | null) {
    const normalized = value?.trim() ?? ''
    return normalized.length > 0 ? normalized : null
}

export async function getOrders(){

    try{
        const supabase = await createServer()

        const {data: {user}} = await supabase.auth.getUser();
        
        if(!user) return;
        
        const {data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

        if(profile?.role === "admin"){
              const {data: orders, error: errorBaskets} = await supabase.from('orders').select('*, order_items(*)')

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


export async function updateOrderStatus(orderID: string, newStatus: string, waybillNumber?: string | null){
    
    try{
        const supabase = await createServer();
        const businessSettings = await getBusinessSettings();
        const normalizedWaybillNumber = normalizeWaybillNumber(waybillNumber)

        const { data: currentOrder, error: currentOrderError } = await supabase
            .from("orders")
            .select("id, order_number, status, subtotal, delivery_fee, total, created_at, customer_name, customer_email, delivery_address, delivery_city, delivery_postal_code, waybill_number, order_items(item_name, quantity, unit_price, line_total)")
            .eq("id", orderID)
            .single<OrderEmailRow>();

        if(currentOrderError){
            throw new Error(currentOrderError.message);
        }

        const previousStatus = currentOrder.status;

        if(previousStatus === newStatus){
            return {success: "success"};
        }

        if(newStatus === "order_shipped" && !normalizedWaybillNumber){
            throw new Error('Waybill number is required when marking an order as shipped')
        }

        const updatePayload: { status: string; waybill_number?: string | null } = { status: newStatus }

        if (newStatus === "order_shipped") {
            updatePayload.waybill_number = normalizedWaybillNumber
        }

        const { error } = await supabase.from('orders').update(updatePayload).eq('id', orderID);

        if(error){
            throw new Error(error.message)
        }

        try{
            const customerEmail = currentOrder?.customer_email;
            if(customerEmail){
                await sendOrderStatusUpdateEmail({
                    previousStatus,
                    orderId: currentOrder.id,
                    orderNumber: currentOrder.order_number,
                    status: newStatus,
                    subtotal: Number(currentOrder.subtotal ?? 0),
                    deliveryFee: Number(currentOrder.delivery_fee ?? 0),
                    total: Number(currentOrder.total ?? 0),
                    createdAt: currentOrder.created_at,
                    customerEmail,
                    customerName: currentOrder.customer_name ?? customerEmail,
                    deliveryAddress: currentOrder.delivery_address ?? '',
                    deliveryCity: currentOrder.delivery_city ?? '',
                    deliveryPostalCode: String(currentOrder.delivery_postal_code ?? ''),
                    waybillNumber: newStatus === "order_shipped" ? normalizedWaybillNumber : currentOrder.waybill_number,
                    items: (currentOrder.order_items ?? []).map((item) => ({
                        item_name: item.item_name,
                        quantity: Number(item.quantity ?? 0),
                        unit_price: Number(item.unit_price ?? 0),
                        line_total: Number(item.line_total ?? 0),
                    })),
                    businessSettings,
                });
            }
        }catch(emailError){
            await logServerError('dashboard.updateOrderStatus.sendOrderStatusUpdateEmail', emailError, { orderID, newStatus, waybillNumber: normalizedWaybillNumber });
        }

        revalidatePath("/dashboard/orders")
        return {success: "success"}

    }catch(error){
        await logServerError('dashboard.updateOrderStatus', error, { orderID, newStatus, waybillNumber })
        throw error
    }
}


export async function cancelOrder(orderID: string, cancelledBy: string){
    try{
        const supabase = await createServer();
        const businessSettings = await getBusinessSettings();

        const { data: currentOrder, error: currentOrderError } = await supabase
            .from("orders")
            .select("id, order_number, status, subtotal, delivery_fee, total, created_at, customer_name, customer_email, delivery_address, delivery_city, delivery_postal_code, waybill_number, order_items(item_name, quantity, unit_price, line_total)")
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
            const customerEmail = currentOrder?.customer_email;
            if(customerEmail){
                await sendOrderStatusUpdateEmail({
                    previousStatus,
                    orderId: currentOrder.id,
                    orderNumber: currentOrder.order_number,
                    status: "cancelled",
                    subtotal: Number(currentOrder.subtotal ?? 0),
                    deliveryFee: Number(currentOrder.delivery_fee ?? 0),
                    total: Number(currentOrder.total ?? 0),
                    createdAt: currentOrder.created_at,
                    customerEmail,
                    customerName: currentOrder.customer_name ?? customerEmail,
                    deliveryAddress: currentOrder.delivery_address ?? '',
                    deliveryCity: currentOrder.delivery_city ?? '',
                    deliveryPostalCode: String(currentOrder.delivery_postal_code ?? ''),
                    waybillNumber: currentOrder.waybill_number,
                    items: (currentOrder.order_items ?? []).map((item) => ({
                        item_name: item.item_name,
                        quantity: Number(item.quantity ?? 0),
                        unit_price: Number(item.unit_price ?? 0),
                        line_total: Number(item.line_total ?? 0),
                    })),
                    businessSettings,
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

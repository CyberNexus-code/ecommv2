'use server'

import { createServer } from "../supabase/server";
import type { BasketItem } from "@/types/basket";
import { getBusinessSettings } from "@/lib/businessSettings";
import { sendOrderPlacedEmails } from "../email/sendOrderEmail";
import { logServerError, logServerWarning } from "@/lib/logging/server";

type PlacedOrderRow = {
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
    order_items: {
        item_name: string | null
        quantity: number | string | null
        unit_price: number | string | null
        line_total: number | string | null
    }[]
}

type OrderUpdateFields = Partial<{
    recipient_name: string
    recipient_age: number
    recipient_date: string
    comments: string | null
}>

export async function addToBasket(itemId: string, quantity: number) {

    const supabase = await createServer();
    const { error } = await supabase.rpc("basket_add_item", {
        p_item_id: itemId,
        p_quantity: quantity,
    });

    if(error){
        throw new Error(`Error adding item to basket: ${error.message}`);
    }
}

export async function getBasket() {
    const supabase = await createServer();

    const { data, error } = await supabase.rpc("get_open_basket_items");

    if(error){
        throw new Error(`Error fetching basket: ${error.message}`);
    }
    
    return (data ?? []) as BasketItem[];
}

export async function placeOrderLogic(
    basket_id: string,
    options?: {
        recipient_name?: string,
        recipient_age?: number,
        recipient_date?: string,
        comments?: string | null,
    }
){
    const supabase = await createServer();

    // Insert order with extra fields
    const { error } = await supabase.rpc('place_order', { p_basket_id: basket_id });

    if(error){
        await logServerError('basket.placeOrderLogic.placeOrder', error, { basketId: basket_id });
        throw new Error(`Error placing order: ${error.message}`);
    }

    // Update the order with the new fields
    if (options) {
        const updateFields: OrderUpdateFields = {};
        if (options.recipient_name) updateFields.recipient_name = options.recipient_name;
        if (options.recipient_age !== undefined) updateFields.recipient_age = options.recipient_age;
        if (options.recipient_date) updateFields.recipient_date = options.recipient_date;
        if (options.comments !== undefined) updateFields.comments = options.comments;

        await supabase
            .from('orders')
            .update(updateFields)
            .eq('basket_id', basket_id);
    }

    try {
        const businessSettings = await getBusinessSettings();
        const { data: placedOrder, error: orderFetchError } = await supabase
            .from("orders")
            .select("id, order_number, status, subtotal, delivery_fee, total, created_at, customer_name, customer_email, delivery_address, delivery_city, delivery_postal_code, recipient_name, recipient_age, recipient_date, comments, order_items(item_name, quantity, unit_price, line_total)")
            .eq("basket_id", basket_id)
            .single<PlacedOrderRow & { recipient_name?: string, recipient_age?: number, recipient_date?: string, comments?: string }>();

        if(orderFetchError){
            await logServerError('basket.placeOrderLogic.fetchPlacedOrder', orderFetchError, { basketId: basket_id });
            return true;
        }

        const customerEmail = placedOrder?.customer_email;

        if(!customerEmail){
            await logServerWarning('basket.placeOrderLogic.missingCustomerEmail', 'No customer email found for placed order', { orderId: placedOrder?.id, basketId: basket_id });
            return true;
        }

        await sendOrderPlacedEmails({
            orderId: placedOrder.id,
            orderNumber: placedOrder.order_number,
            status: placedOrder.status,
            subtotal: Number(placedOrder.subtotal ?? 0),
            deliveryFee: Number(placedOrder.delivery_fee ?? 0),
            total: Number(placedOrder.total ?? 0),
            createdAt: placedOrder.created_at,
            customerEmail,
            customerName: placedOrder.customer_name ?? customerEmail,
            deliveryAddress: placedOrder.delivery_address ?? '',
            deliveryCity: placedOrder.delivery_city ?? '',
            deliveryPostalCode: String(placedOrder.delivery_postal_code ?? ''),
            recipientName: placedOrder.recipient_name,
            recipientAge: placedOrder.recipient_age,
            recipientDate: placedOrder.recipient_date,
            comments: placedOrder.comments,
            items: (placedOrder.order_items ?? []).map((item) => ({
                item_name: item.item_name,
                quantity: Number(item.quantity ?? 0),
                unit_price: Number(item.unit_price ?? 0),
                line_total: Number(item.line_total ?? 0),
            })),
            businessSettings,
        });
    } catch (emailError){
        await logServerError('basket.placeOrderLogic.sendOrderEmail', emailError, { basketId: basket_id });
    }

    return true;
}

export async function setProfileEmail(email: string){
    const supabase = await createServer();
    const { data: { user } } = await supabase.auth.getUser();

    if(!user){
        throw new Error("Not authenticated");
    }

    const { error } = await supabase.from('profiles').update({email: email}).eq('id', user.id);

    if(error){
        await logServerError('basket.setProfileEmail', error, { userId: user.id });
        throw new Error(`Error setting email: ${error.message}`);
    }

    return true;
}



'use server'

import { createServer } from "../supabase/server";
import type { BasketItem } from "@/types/basket";
import { sendOrderPlacedEmails } from "../email/sendOrderEmail";
import { logServerError, logServerWarning } from "@/lib/logging/server";

type PlacedOrderRow = {
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

export async function placeOrderLogic(basket_id: string){
    const supabase = await createServer();

    const { error } = await supabase.rpc('place_order', { p_basket_id: basket_id });

    if(error){
        await logServerError('basket.placeOrderLogic.placeOrder', error, { basketId: basket_id });
        throw new Error(`Error placing order: ${error.message}`);
    }

    try {
        const { data: placedOrder, error: orderFetchError } = await supabase
            .from("orders")
            .select("id, order_number, status, total, created_at, profiles(email), order_items(item_name, quantity, unit_price, line_total)")
            .eq("basket_id", basket_id)
            .single<PlacedOrderRow>();

        if(orderFetchError){
            await logServerError('basket.placeOrderLogic.fetchPlacedOrder', orderFetchError, { basketId: basket_id });
            return true;
        }

        const customerEmail = (Array.isArray(placedOrder?.profiles) 
            ? placedOrder.profiles[0]?.email 
            : placedOrder?.profiles?.email);

        if(!customerEmail){
            await logServerWarning('basket.placeOrderLogic.missingCustomerEmail', 'No customer email found for placed order', { orderId: placedOrder?.id, basketId: basket_id });
            return true;
        }

        await sendOrderPlacedEmails({
            orderId: placedOrder.id,
            orderNumber: placedOrder.order_number,
            status: placedOrder.status,
            total: Number(placedOrder.total ?? 0),
            createdAt: placedOrder.created_at,
            customerEmail,
            items: (placedOrder.order_items ?? []).map((item) => ({
                item_name: item.item_name,
                quantity: Number(item.quantity ?? 0),
                unit_price: Number(item.unit_price ?? 0),
                line_total: Number(item.line_total ?? 0),
            })),
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



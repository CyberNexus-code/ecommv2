'use server'

import { createServer } from "../supabase/server";
import type { BasketItem } from "@/types/basket";
import { sendOrderPlacedEmails } from "../email/sendOrderEmail";

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
        console.error(`Error placing order: ${error.message}`);
        throw new Error(`Error placing order: ${error.message}`);
    }

    try {
        const { data: placedOrder, error: orderFetchError } = await supabase
            .from("orders")
            .select("id, order_number, status, total, created_at, profiles(email), order_items(item_name, quantity, unit_price, line_total)")
            .eq("basket_id", basket_id)
            .single();

        if(orderFetchError){
            console.error("Unable to fetch placed order for email:", orderFetchError.message);
            return true;
        }

        const customerEmail = placedOrder?.profiles?.email;

        if(!customerEmail){
            console.warn("No customer email found for placed order", placedOrder?.id);
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
        console.error("Order placed but confirmation emails failed:", emailError);
    }

    return true;
}

export async function setProfileEmail(id: string, email: string){
    const supabase = await createServer();

    const { error } = await supabase.from('profiles').update({email: email}).eq('id', id);

    if(error){
        console.error(`Error setting email: ${error}`);
    }

    console.log("Setting email for user:", id);

    return true;
}



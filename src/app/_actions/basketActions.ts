'use server'

import { createServer } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { placeOrderLogic, setProfileEmail } from "@/lib/baskets/basket";
import { getBusinessSettings } from "@/lib/businessSettings";
import { hasRegisteredAccountEmail, normalizeEmail } from "@/lib/auth/accountLookup";
import { logServerError } from "@/lib/logging/server";

export async function setItemQuantity(basket_id: string, id: string, qty: number) {
    const supabase = await createServer();

    const { error } = await supabase.rpc("basket_set_item_quantity", {
        p_basket_id: basket_id,
        p_basket_item_id: id,
        p_quantity: qty,
    });

    if(error){
        throw new Error(`Error updating basket item quantity: ${error.message}`);
    }

    revalidatePath("/basket")
}


export async function removeBasketItem(basket_id: string, id: string){
    const supabase = await createServer();

    const { error } = await supabase.rpc("basket_remove_item", {
        p_basket_id: basket_id,
        p_basket_item_id: id,
    });

    if(error){
         throw new Error(`Error removing item from basket: ${error.message}`);
    }

    revalidatePath("/basket")
}

export async function  placeOrder(formData: FormData) {
    const basket_id = formData.get('basket_id') as string
    const checkoutConfirmation = formData.get('checkout_confirmation') as string
    const recipient_name = formData.get('recipient_name') as string
    const recipient_age = formData.get('recipient_age') as string
    const recipient_date = formData.get('recipient_date') as string
    const comments = formData.get('comments') as string | null

    if(!basket_id){
        await logServerError('basketActions.placeOrder.missingBasketId', new Error('No basket id received from form submission'));
        throw new Error("Unable to place order: missing basket reference.");
    }

    if(checkoutConfirmation !== 'accepted'){
        await logServerError('basketActions.placeOrder.missingConfirmation', new Error('Checkout confirmation checkbox was not accepted before order submission'));
        throw new Error("Please confirm the terms and that your delivery address is accurate before placing the order.");
    }

    if(!recipient_name || recipient_name.length < 2) {
        throw new Error("Recipient name is required and must be at least 2 characters.");
    }
    if(!recipient_age || isNaN(Number(recipient_age)) || Number(recipient_age) < 0) {
        throw new Error("Recipient age is required and must be a valid number.");
    }
    if(!recipient_date) {
        throw new Error("Date is required.");
    }

    // Enforce admin-configurable minimum days for handmade items
    const settings = await getBusinessSettings();
    const minDays = settings.order_min_days_notice ?? 14;
    const today = new Date();
    today.setHours(0,0,0,0);
    const selectedDate = new Date(recipient_date);
    selectedDate.setHours(0,0,0,0);
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysDiff = Math.round((selectedDate.getTime() - today.getTime()) / msPerDay);
    if (daysDiff < minDays) {
        throw new Error(`Because these items are handmade, it will take a minimum of ${minDays} days to fulfill the order. Please select a date at least ${minDays} days from today.`);
    }

    await placeOrderLogic(basket_id, {
        recipient_name,
        recipient_age: Number(recipient_age),
        recipient_date,
        comments: comments || null,
    });

    revalidatePath("/basket")
}

export type GuestCheckoutEmailState = {
    success: boolean;
    error: string | null;
    accountExists: boolean;
    email: string;
}

export async function saveGuestCheckoutEmail(
    _prevState: GuestCheckoutEmailState,
    formData: FormData,
): Promise<GuestCheckoutEmailState> {
    const email = formData.get('email') as string
    const id = formData.get('id') as string

    if(!email || !id){
        return {
            success: false,
            error: 'Please provide an email address.',
            accountExists: false,
            email: '',
        }
    }

    const normalizedEmail = normalizeEmail(email)
    const supabase = await createServer();
    const { data: { user } } = await supabase.auth.getUser();

    if(!user || user.id !== id){
        return {
            success: false,
            error: 'Unable to update the guest email for this basket.',
            accountExists: false,
            email: normalizedEmail,
        }
    }

    try {
        await setProfileEmail(normalizedEmail);
        const accountExists = await hasRegisteredAccountEmail(normalizedEmail, id);

        revalidatePath("/basket")

        return {
            success: true,
            error: null,
            accountExists,
            email: normalizedEmail,
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unable to save the email address.',
            accountExists: false,
            email: normalizedEmail,
        }
    }
}

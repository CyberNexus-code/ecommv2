'use server'

import { createServer } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { placeOrderLogic, setProfileEmail } from "@/lib/baskets/basket";
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

    if(!basket_id){
        await logServerError('basketActions.placeOrder.missingBasketId', new Error('No basket id received from form submission'));
        throw new Error("Unable to place order: missing basket reference.");
    }

    await placeOrderLogic(basket_id);

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

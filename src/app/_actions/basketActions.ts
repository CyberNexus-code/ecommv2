'use server'

import { createServer } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { placeOrderLogic, setProfileEmail } from "@/lib/baskets/basket";

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
        console.error("No basket id received from form submisssion");
    }

    await placeOrderLogic(basket_id);

    revalidatePath("/basket")

}

export async function setEmail(formData: FormData){
    const email = formData.get('email') as string
    const id = formData.get('id') as string

    if(!email){
        console.error("No email provided");
    }

    await setProfileEmail(id, email);

    revalidatePath("/basket")
}

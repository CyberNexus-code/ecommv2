'use server'

import { createServer } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { placeOrderLogic } from "@/lib/supabase/basket";

export async function setItemQuantity(basket_id: string, id: string, qty: number) {
    const supabase = await createServer();

    const { data, error} = await supabase.from('basket_items').update({quantity: qty}).eq('basket_id', basket_id).eq('id', id);

    revalidatePath("/basket")
}


export async function removeBasketItem(basket_id: string, id: string){

    console.log("Basket_id:",basket_id);
    console.log("id:", id);
    const supabase = await createServer();

    const { data: removeItem, error} = await supabase.from('basket_items').delete().eq('basket_id', basket_id).eq('id', id);

    if(error){
         throw new Error(`Error removing item from basket: ${error.message}`);
    }

    revalidatePath("/basket")

    return { success: true }
}

export async function  placeOrder(formData: FormData) {
    const basket_id = formData.get('basket_id') as string

    if(!basket_id){
        console.error("No basket id received from form submisssion");
    }

    await placeOrderLogic(basket_id);
}
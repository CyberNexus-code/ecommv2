'use server'

import { createServer } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getBasket() {
    const supabase = await createServer();

    const {data: {user}, error: userError} = await supabase.auth.getUser();

    const {data: basketId, error: basketError} = await supabase.from('baskets').select('id').or(`user_id.eq.${user?.id}, session_id.eq.${user?.id}`).single()

    if(basketError) throw basketError

    const {data: basket, error: baketFetchError} = await supabase.from('basket_items').select('*, items(id, name, price, item_images(id, image_url, is_thumbnail))').eq('basket_id', basketId.id)
    
    return basket
}

export async function setItemQuantity(basket_id: string, id: string, qty: number) {
    const supabase = await createServer();

    const { data, error} = await supabase.from('basket_items').update({quantity: qty}).eq('basket_id', basket_id).eq('item_id', id);

}

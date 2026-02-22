'use server'

import { createServer } from "./server";

export async function addToBasket(itemId: string, quantity: number) {

    const supabase = await createServer();
    const userId = await supabase.auth.getUser().then(({data: {user}}) => user?.id);

    if(!userId){
        throw new Error('User not authenticated');
    }else{
       const { data, error } = await supabase.from('baskets').select('id').eq('user_id', userId).eq('status', 'open');
       console.log("full Basket data:", {data, error})
       const basketId = data ? data[0]?.id : null;

       console.log("Existing basket ID:", basketId)

       if(!basketId){
            console.log("Creating new basket");
            await supabase.from('baskets').insert({user_id: userId});
            const { data } =  await supabase.from('baskets').select('id').eq('user_id', userId).eq('status', 'open').limit(1);
            const newBasketId = data ? data[0]?.id : null;
            console.log("New basket ID:", newBasketId);
            await supabase.from('basket_items').insert({basket_id: newBasketId, item_id: itemId, quantity});
       } else {
        console.log("Using existing basket:",basketId );
            const { data } = await supabase.from('basket_items').select('id, quantity').eq('basket_id', basketId).eq('item_id', itemId).limit(1);
            const basketItem = data ? data[0] : null;

            if(!basketItem || basketItem === null){
                console.log("Adding item to basket")
                await supabase.from('basket_items').insert({basket_id: basketId, item_id: itemId, quantity});
                console.log("quantity:", quantity)
            }
            else{
                console.log("Item in basket... updating quantity")
                await supabase.from('basket_items').update({'quantity':  basketItem?.quantity + quantity}).eq('basket_id', basketId).eq('item_id', itemId);
            }
       }
    }

}

export async function getBasket() {
    const supabase = await createServer();

    const {data: {user}, error: userError} = await supabase.auth.getUser();

    const {data: basketId, error: basketError} = await supabase.from('baskets').select('id').or(`user_id.eq.${user?.id}, session_id.eq.${user?.id}`).filter('status', 'eq', 'open').maybeSingle()

    if(basketError) throw basketError

    const {data: basket, error: baketFetchError} = await supabase.from('basket_items').select('*, items(id, name, price, item_images(id, image_url, is_thumbnail))').eq('basket_id', basketId?.id).order('created_at', {ascending: false})
    
    return basket
}

export async function placeOrderLogic(basket_id: string){
    const supabase = await createServer();

    const { error } = await supabase.from('baskets').update({status: 'order_placed_pending_payment'}).eq('id', basket_id)

    if(error){
        console.error(`Error placing order: ${error.message}`);
    }

    console.log("Placing order for basket id:", basket_id)

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



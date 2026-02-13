import { createClient } from "@/lib/supabase/client";

export async function addToBasket(itemId: string, quantity: number) {

    console.log(itemId, quantity)

    const supabase = createClient();
    const userId = await supabase.auth.getUser().then(({data: {user}}) => user?.id);

    console.log("user ID:", userId)
    console.log(typeof userId)

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

            const newQuantity = basketItem?.quantity + quantity;
            console.log("current quantity:", basketItem?.quantity)
            console.log("new quantity:", newQuantity)
            await supabase.from('basket_items').update({'quantity':  newQuantity}).eq('basket_id', basketId).eq('item_id', itemId);
       }
    }

}


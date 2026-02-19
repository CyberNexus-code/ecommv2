import { createServer } from "./server";

export async function getOrders(){

    console.log("Calling get ordres")

    try{
        const supabase = await createServer()

        const {data: {user}, error: userError} = await supabase.auth.getUser();
        
        if(!user) return;
        
        const {data: profile, error: roleError } = await supabase.from('profiles').select('role').eq('id', user.id).single()

        console.log(profile)
        if(profile?.role === "admin"){
           const {data: baskets, error: errorBaskets} = await supabase.from('baskets').select('*, basket_items(*, items(*, item_images(*)))').neq('status', 'open')
           console.log(baskets?.[0].basket_items?.[0])

           return baskets
        }

    }catch(error){
        console.log(error)
    }
}
import { createServer } from "../supabase/server";

export async function getOrders(){

    console.log("Calling get ordres")

    try{
        const supabase = await createServer()

        const {data: {user}, error: userError} = await supabase.auth.getUser();
        
        if(!user) return;
        
        const {data: profile, error: roleError } = await supabase.from('profiles').select('role').eq('id', user.id).single()

        console.log(profile)
        if(profile?.role === "admin"){
           const {data: orders, error: errorBaskets} = await supabase.from('orders').select('*, profiles(email)').neq('status', 'open')

           console.log("get orders:", orders)
           return orders
        }

    }catch(error){
        console.log(error)
    }
}
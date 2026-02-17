import { createServer } from "./supabase/server";

export async function getUserRole(){
    const supabase = await createServer();

    const {data: {user}} = await supabase.auth.getUser();

    console.log(user)

    if(!user) return null;

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

    return profile?.role || null;
}
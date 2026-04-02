import { createServer } from "../supabase/server";

export async function setProfileAdress(profile_id: string, street_no: string, street_name: string,city: string, postal_code: string){

    if(!Number(postal_code)){
        throw new Error("Postal code can only have numeric characters");
    }
    const supabase = await createServer();
    const { error } = await supabase.from('profiles').update({delivery_address: `${street_no} ${street_name}`, city: city, postal_code: postal_code}).eq('id', profile_id);

    if(error) {
        throw new Error(`Error setting address: ${error.message}`)
    }

}

export async function getUserWithProfile(){

    const supabase = await createServer();
    const {data: {user}} = await supabase.auth.getUser();

    if(!user) return { user: null, profile: null};

    const {data: profile} = await supabase.from('profiles').select().eq('id', user.id).single();

    return { user, profile}
}
import { createServer } from "../supabase/server";

export async function setProfileAdress(profile_id: string, street_no: string, street_name: string,city: string, postal_code: string){

    if(!Number(postal_code)){
        throw new Error("Postal code can only have numeric characters");
    }
    const supabase = await createServer();
    const { error } = await supabase.from('profiles').update({delivery_address: `${street_no} ${street_name}`, city: city, postal_code: postal_code}).eq('id', profile_id);

    if(error) {
        console.log(`Error setting address: ${error.message}`)
        throw new Error(`Error setting address: ${error.message}`)
    }

}
"use server"

import { createServer } from "@/lib/supabase/server"
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { setProfileAdress } from "@/lib/profiles/profiles";

export async function logout() {
    const supabase = await createServer();
    await supabase.auth.signOut();
    redirect("/");
}

export async function setAddress(formData: FormData) {
    const profile_id = formData.get("profile_id") as string;
    const street_no = formData.get("street_no") as string;
    const street_name = formData.get("street_name") as string;
    const postal_code = formData.get("postal_code") as string;
    const city = formData.get("city") as string;

    if(profile_id && street_name && street_no && postal_code && city){
        await setProfileAdress(profile_id, street_no, street_name, city, postal_code);
    }

    revalidatePath("/basket")

    console.log(profile_id, street_name, street_no, postal_code, city)
}

export async function updateProfileField(field: string, value: string){
    const supabase = await createServer();

    const { data: {user} } = await supabase.auth.getUser();
    
    if(!user) throw new Error("Not authenticated");

    if(field === "email" && !user.is_anonymous){
        const { error } = await supabase.auth.updateUser({ email: value });

        if(error){
            console.error(error);
            throw new Error("Failed to request email change");
        }

        revalidatePath("/account");
        return { success: true, message: "Please confirm the email change from your inbox." };
    }

    const allowedProfileFields = new Set([
        "first_name",
        "last_name",
        "username",
        "email",
        "delivery_address",
        "city",
        "postal_code",
    ]);

    if(!allowedProfileFields.has(field)){
        throw new Error("Field is not editable");
    }

    const { error } = await supabase.from('profiles').update({ [field]: value}).eq('id', user.id);

    if(error){
        console.error(error);
        throw new Error("Failed to upload profile");
    }

    revalidatePath("/account");
    return { success: true}
}

export async function deleteOwnAccount(){
    const supabase = await createServer();

    const { data: { user } } = await supabase.auth.getUser();

    if(!user){
        throw new Error("Not authenticated");
    }

    const { error } = await supabase.rpc("soft_delete_my_account");

    if(error){
        console.error(error);
        throw new Error("Failed to delete account");
    }

    await supabase.auth.signOut();
    redirect("/");
}

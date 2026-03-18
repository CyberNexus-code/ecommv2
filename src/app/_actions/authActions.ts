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
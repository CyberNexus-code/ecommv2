'use server'

import { createServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateCategory(id: string, name: string){
    const supabase = await createServer();

    const { data, error } = await supabase.from('categories').update({name}).eq('id', id).select();

    if(error) throw error;

    console.log("Category update was called");

    revalidatePath("/dashboard/categories");

    return data;
}

export async function removeCategory(id: string){
    const supabase = await createServer();

    console.log("Remove category was called");

    const { data, error } = await supabase.from('categories').update({'is_active': false, 'is_deleted': true}).eq('id', id)

    if(error){
        console.error("There was an error deleteing the category:", error)
    };

    revalidatePath("/dashboard/categories");

    return data;
}

export async function addCategory(name: string){
    const supabase = await createServer();
    const { data, error} = await supabase.from('categories').insert({name}).select();

    if(error){
        console.error("Error inserting category into categories table:", error);
    };

    revalidatePath("/dashboard/categories");

    return data;

}
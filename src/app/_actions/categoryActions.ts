'use server'

import { createServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { CategoryType } from "@/types/categoryType";

export async function updateCategory(id: string, name: string){
    const supabase = await createServer();

    const { data, error } = await supabase.from('categories').update({name}).eq('id', id).select();

    if(error) throw error;

    revalidatePath("/dashboard/categories");

    return data;
}

export async function removeCategory(id: string){
    const supabase = await createServer();

    const { error: clearItemsError } = await supabase
        .from('items')
        .update({ category_id: null })
        .eq('category_id', id)

    if (clearItemsError) {
        throw new Error(`There was an error clearing products for the category: ${clearItemsError.message}`)
    }

    const { data, error } = await supabase.from('categories').update({'is_active': false, 'is_deleted': true}).eq('id', id)

    if(error){
        throw new Error(`There was an error deleting the category: ${error.message}`)
    };

    revalidatePath("/dashboard/categories");
    revalidatePath("/dashboard/products");
    revalidatePath("/products");

    return data;
}

export async function addCategory(name: string){
    const supabase = await createServer();
    const { data, error} = await supabase.from('categories').insert({name}).select().single();

    if(error){
        throw new Error(`Error inserting category into categories table: ${error.message}`);
    };

    revalidatePath("/dashboard/categories");
    revalidatePath("/dashboard/products");
    revalidatePath("/products");

    return data as CategoryType;

}
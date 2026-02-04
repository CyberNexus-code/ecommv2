'use server'

import { createServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProduct(id: string, name: string, price: number, category_id: string | null, description?: string){
    const supabase = await createServer();

    const { data, error } = await supabase.from('items').update({name, price, category_id, description}).eq('id', id).select();

    if(error) throw error;

    revalidatePath("/dashboard/products");

    return data;
}

export async function removeProduct(id: string){

    const supabase = await createServer()

    const { data, error } = await supabase.from('items').update({'is_active': false, 'is_deleted': true}).eq('id', id)

    if(error){
        console.error("There was an error deleteing the product:", error)
    }

    revalidatePath("/dashboard/products");

    return data;

}

export async function addProduct(name: string, category_id: string, description: string, price: number){
    const supabase = await createServer()

    const { data, error} = await supabase.from('items').insert({name, category_id, description, price}).select();

    if(error){
        console.error("Error inserting product into items table:", error);
    }

    revalidatePath("/dashboard/products");
    
    return data
}

export async function fetchImages(id: string){
    const supabase = await createServer()
    const {data: images, error} = await supabase.from('item_images').select('*').eq('item_id', id).order('sort_order');

    return { images: images ?? [], error }

}
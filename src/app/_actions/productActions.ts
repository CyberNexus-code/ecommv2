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

    revalidatePath("/dashboard/products");

    return { images: images ?? [], error }


}

export async function saveProductImages({productId, images} : {productId: string, images: { id?: string; image_url: string; is_thumbnail: boolean}[]}){
    const supabase = await createServer();
    const newImages = images.filter(img => !img.id);
    console.log("New image arr:", newImages)

    if(newImages.length > 0){
         const { error: insertError } = await supabase.from('item_images').insert(
            newImages.map((img: any) => ({
                item_id: productId,
                image_url: img.image_url,
                is_thumbnail: img.is_thumbnail
            }))
        )

        if (insertError) throw insertError
    }

    const existingImages = images.filter(img => img.id)
    console.log("Existing image arr:", existingImages)

    for(const img of existingImages){
        const {data, error: updateError } = await supabase.from('item_images').update({ is_thumbnail: img.is_thumbnail}).eq('id', img.id);

        if(updateError) throw updateError;

        revalidatePath("/dashboard/products");
        return data
    }
}

export async function getThumbnails(id:string) {
    const supabase = await createServer();

    const {data, error} = await supabase.from('item_images').select('*').eq('item_id', id).eq('is_thumbnail', true);

    return data;
}
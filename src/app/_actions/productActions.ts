'use server'

import { createServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ItemImage, ProductFormValues } from "@/types/itemType";

type PersistedProductImage = Omit<Pick<ItemImage, "id" | "image_url" | "storage_path" | "is_thumbnail" | "alt_text" | "sort_order">, "id"> & {
    id?: string
};

export async function updateProduct(id: string, values: ProductFormValues){
    const supabase = await createServer();

    const { data, error } = await supabase.from('items').update({
        name: values.name,
        price: values.price,
        category_id: values.category_id,
        description: values.description,
        meta_title: values.meta_title || null,
        meta_description: values.meta_description || null,
    }).eq('id', id).select();

    if(error) throw error;

    revalidatePath("/dashboard/products");
    revalidatePath("/products");

    return data;
}

export async function removeProduct(id: string){

    const supabase = await createServer()

    const { data, error } = await supabase.from('items').update({'is_active': false, 'is_deleted': true}).eq('id', id)

    if(error){
        throw new Error(`There was an error deleting the product: ${error.message}`)
    }

    revalidatePath("/dashboard/products");
    revalidatePath("/products");

    return data;

}

export async function addProduct(values: ProductFormValues){
    const supabase = await createServer()

    const { data, error} = await supabase.from('items').insert({
        name: values.name,
        category_id: values.category_id,
        description: values.description,
        price: values.price,
        meta_title: values.meta_title || null,
        meta_description: values.meta_description || null,
    }).select();

    if(error){
        throw new Error(`Error inserting product into items table: ${error.message}`);
    }

    revalidatePath("/dashboard/products");
    revalidatePath("/products");
    
    return data
}

export async function fetchImages(id: string){
    const supabase = await createServer()
    const {data: images, error} = await supabase.from('item_images').select('id, item_id, image_url, storage_path, sort_order, is_thumbnail, alt_text, created_at').eq('item_id', id).order('sort_order');

    return { images: images ?? [], error }
}

export async function saveProductImages({productId, images} : {productId: string, images: PersistedProductImage[]}){
    const supabase = await createServer();
    const newImages = images.filter(img => !img.id);

    if(newImages.length > 0){
         const { error: insertError } = await supabase.from('item_images').insert(
            newImages.map((img, index) => ({
                item_id: productId,
                image_url: img.image_url,
                storage_path: img.storage_path,
                is_thumbnail: img.is_thumbnail,
                alt_text: img.alt_text || null,
                sort_order: img.sort_order ?? index,
            }))
        )

        if (insertError) throw insertError
    }

    const existingImages = images.filter(img => img.id)

    for(const img of existingImages){
        const { error: updateError } = await supabase.from('item_images').update({
            is_thumbnail: img.is_thumbnail,
            alt_text: img.alt_text || null,
            sort_order: img.sort_order ?? 0,
        }).eq('id', img.id);

        if(updateError) throw updateError;

    }

    revalidatePath("/dashboard/products")
    revalidatePath("/products")
}

export async function getThumbnails(id:string) {
    const supabase = await createServer();

    const {data} = await supabase.from('item_images').select('id, item_id, image_url, storage_path, sort_order, is_thumbnail, alt_text').eq('item_id', id).eq('is_thumbnail', true);

    return data;
}

export async function deleteImage(storagePath: string){
    const supabase = await createServer();

    const { error: storageError} = await supabase.storage.from('product-images').remove([storagePath])
    if(storageError){
        throw new Error(`Error deleting image: ${storageError.message}`)
    }

    const { error: dbError } = await supabase.from('item_images').delete().eq('storage_path', storagePath);

    if(dbError){
        throw new Error(`Error deleting image record: ${dbError.message}`)
    }

    revalidatePath("/dashboard/products")
    revalidatePath("/products")
}
'use server'

import { createServer } from "@/lib/supabase/server";
import { logServerError } from "@/lib/logging/server";
import { revalidatePath } from "next/cache";
import type { ItemImage, ItemType, ProductFormValues } from "@/types/itemType";

type PersistedProductImage = Omit<Pick<ItemImage, "id" | "image_url" | "storage_path" | "is_thumbnail" | "alt_text" | "sort_order">, "id"> & {
    id?: string
};

export async function updateProduct(id: string, values: ProductFormValues, options?: { isActive?: boolean }){
    const supabase = await createServer();

    const currentProductResult = await supabase
        .from('items')
        .select('price')
        .eq('id', id)
        .single()

    if (currentProductResult.error) {
        await logServerError('productActions.updateProduct.current', currentProductResult.error, { id })
        throw new Error(`There was an error loading the product before update: ${currentProductResult.error.message}`)
    }

    const priceChanged = Number(currentProductResult.data.price) !== Number(values.price)

    const updatePayload: {
        name: string
        price: number
        category_id: string | null
        description: string
        meta_title: string | null
        meta_description: string | null
        price_reviewed_at: string | undefined
        is_active?: boolean
    } = {
        name: values.name,
        price: values.price,
        category_id: values.category_id,
        description: values.description,
        meta_title: values.meta_title || null,
        meta_description: values.meta_description || null,
        price_reviewed_at: priceChanged ? new Date().toISOString() : undefined,
    }

    if (typeof options?.isActive === 'boolean') {
        updatePayload.is_active = options.isActive
    }

    const { data, error } = await supabase.from('items').update(updatePayload).eq('id', id).select();

    if(error) {
        await logServerError('productActions.updateProduct.persist', error, { id, isActive: options?.isActive })
        throw new Error(`There was an error updating the product: ${error.message}`)
    }

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

export async function setProductActive(id: string, isActive: boolean){
    const supabase = await createServer()

    const { data, error } = await supabase
        .from('items')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()

    if (error) {
        throw new Error(`There was an error updating product visibility: ${error.message}`)
    }

    revalidatePath('/dashboard/products')
    revalidatePath('/products')

    return data
}

export async function markProductPricingReviewed(id: string) {
    const supabase = await createServer()

    const { data, error } = await supabase
        .from('items')
        .update({ price_reviewed_at: new Date().toISOString() })
        .eq('id', id)
        .select()

    if (error) {
        throw new Error(`There was an error updating the price review date: ${error.message}`)
    }

    revalidatePath('/dashboard/products')

    return data
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
    }).select('*, categories (name), item_images (id, item_id, image_url, storage_path, sort_order, is_thumbnail, alt_text), items_tags (item_id, tag_id, tags (id, name, slug, description))').single();

    if(error){
        throw new Error(`Error inserting product into items table: ${error.message}`);
    }

    revalidatePath("/dashboard/products");
    revalidatePath("/products");
    
    return data as ItemType
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
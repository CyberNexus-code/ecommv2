import { createServer } from "../supabase/server";
import type { CategoryType } from "@/types/categoryType";
import type { ItemTag, ItemType } from "@/types/itemType";
import { logServerError } from "@/lib/logging/server";

const itemSelect = '*, categories (name), item_images (id, item_id, image_url, storage_path, sort_order, is_thumbnail, alt_text), items_tags (item_id, tag_id, tags (id, name, slug, description))'

export async function getAllItems(){

    const supabase = await createServer();
    //const {data: items, error} = await supabase.from('items').select('*,item_images(*), categories(name) -> category_name').eq('is_active', true).eq('is_deleted', false).order('name', {ascending: true});
    const { data: items, error} = await supabase.from('items').select(itemSelect).eq('is_deleted', false).eq('is_active', true).order('name', {ascending: true})

    if(error){
        await logServerError('items.getAllItems', error);
        return {items: [], error}
    }

    return {items: items ?? [], error}
}

export async function getCategory(category: string): Promise<Partial<CategoryType> | null> {

    const supabase = await createServer();
    
    const { data, error } = await supabase.from('categories').select('id, name').eq('name', category).limit(1);

    if(error){
        await logServerError('items.getCategory', error, { category });
        return null
    }

    if(!data || data.length === 0) return null;

    return data[0]

}

export async function getAllCategories(){
    const supabase = await createServer();
    const {data: categories, error} = await supabase.from('categories').select('*').eq('is_active', true).eq('is_deleted', false).order('name', {ascending: true});

    if(error){
        await logServerError('items.getAllCategories', error);
        return {categories: [], error}
    }

    return {categories: categories ?? [], error};
}


export async function getItemsByCategory(category: string){

    const supabase = await createServer();
    const cat = await getCategory(category);

    if(!cat?.id){
        return { items: [], error: null}
    }

    const {data: items, error} = await supabase.from('items').select(itemSelect).eq('category_id', cat.id).eq('is_active', true).eq('is_deleted', false)

    if(error){
        await logServerError('items.getItemsByCategory', error, { category, categoryId: cat.id });
        return { items: [], error}
    }

    return { items: items ?? [], error}
}

export async function getItemById(id: string){

    const supabase = await createServer();

    const { data: item, error } = await supabase
        .from('items')
        .select(itemSelect)
        .eq('id', id)
        .eq('is_active', true)
        .eq('is_deleted', false)
        .maybeSingle();

    if(error){
        await logServerError('items.getItemById', error, { id });
        return { item: null, error }
    }

    return { item, error }
}

export async function getRelatedItems(item: { id: string; category_id: string | null; items_tags?: { tags: { slug: string } | null }[] }, limit = 3) {

    const supabase = await createServer();
    const { data: items, error } = await supabase
        .from('items')
        .select(itemSelect)
        .neq('id', item.id)
        .eq('is_active', true)
        .eq('is_deleted', false)
        .order('name', { ascending: true });

    if (error) {
        await logServerError('items.getRelatedItems', error, { itemId: item.id, categoryId: item.category_id });
        return { items: [], error };
    }

    const currentTagSlugs = new Set(
        (item.items_tags ?? [])
            .map((tag) => tag.tags?.slug)
            .filter((slug): slug is string => Boolean(slug))
    );

    const relatedItems = ((items ?? []) as ItemType[])
        .map((candidate) => {
            const candidateTagSlugs = (candidate.items_tags ?? [])
                .map((tag: ItemTag) => tag.tags?.slug)
                .filter((slug): slug is string => Boolean(slug));

            const sharedTagCount = candidateTagSlugs.reduce((count, slug) => count + (currentTagSlugs.has(slug) ? 1 : 0), 0);
            const sameCategoryScore = candidate.category_id && candidate.category_id === item.category_id ? 2 : 0;

            return {
                candidate,
                score: sameCategoryScore + sharedTagCount,
            };
        })
        .sort((left, right) => right.score - left.score || left.candidate.name.localeCompare(right.candidate.name))
        .slice(0, limit)
        .map((entry) => entry.candidate);

    return { items: relatedItems, error: null };
}


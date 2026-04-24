import { createServer } from "../supabase/server";
import type { CategoryType } from "@/types/categoryType";
import type { ItemTag, ItemType } from "@/types/itemType";
import { logServerError } from "@/lib/logging/server";
import { normalizeCategoryName } from "@/lib/items/categories";
import { getCategorySlug, isSemanticTagSlug } from '@/lib/items/tagMetadata';

const itemSelect = '*, categories (name), item_images (id, item_id, image_url, storage_path, sort_order, is_thumbnail, alt_text), items_tags (item_id, tag_id, tags (id, name, slug, description))'

export async function getAllItems({ includeInactive = false }: { includeInactive?: boolean } = {}){

    const supabase = await createServer();
    let query = supabase.from('items').select(itemSelect).eq('is_deleted', false)

    if (!includeInactive) {
        query = query.eq('is_active', true)
    }

    const { data: items, error} = await query.order('name', {ascending: true})

    if(error){
        await logServerError('items.getAllItems', error);
        return {items: [], error}
    }

    return {items: items ?? [], error}
}

export async function getCategory(category: string): Promise<Partial<CategoryType> | null> {

    const supabase = await createServer();
    const normalizedCategory = normalizeCategoryName(category);
    
    const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .eq('is_deleted', false)
        .ilike('name', normalizedCategory)
        .limit(1);

    if(error){
        await logServerError('items.getCategory', error, { category, normalizedCategory });
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

export async function getRelatedItems(
    item: Pick<ItemType, 'id' | 'category_id' | 'categories'> & {
        items_tags?: { tags: { slug: string } | null }[]
    },
    limit = 6,
) {

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
    const currentCategorySlug = 'categories' in item ? getCategorySlug(item.categories?.name) : null

    const relatedItems = ((items ?? []) as ItemType[])
        .map((candidate) => {
            const candidateTagSlugs = new Set((candidate.items_tags ?? [])
                .map((tag: ItemTag) => tag.tags?.slug)
                .filter((slug): slug is string => Boolean(slug)));
            const candidateCategorySlug = getCategorySlug(candidate.categories?.name)
            const categorySlugs = new Set<string>()

            if (currentCategorySlug) {
                categorySlugs.add(currentCategorySlug)
            }

            if (candidateCategorySlug) {
                categorySlugs.add(candidateCategorySlug)
            }

            const semanticSharedTagCount = Array.from(currentTagSlugs).reduce((count, slug) => {
                if (!candidateTagSlugs.has(slug)) {
                    return count
                }

                return count + (isSemanticTagSlug(slug, categorySlugs) ? 1 : 0)
            }, 0)
            const genericSharedTagCount = Array.from(currentTagSlugs).reduce((count, slug) => {
                if (!candidateTagSlugs.has(slug)) {
                    return count
                }

                return count + (isSemanticTagSlug(slug, categorySlugs) ? 0 : 1)
            }, 0)
            const hasSemanticOverlap = semanticSharedTagCount > 0 ? 1 : 0
            const sameCategoryScore = candidate.category_id && candidate.category_id === item.category_id ? 1 : 0;
            const imageScore = Math.min(candidate.item_images.length, 4) * 0.25;
            const currentPrice = 'price' in item && typeof item.price === 'number' ? item.price : null;
            const priceDistance = currentPrice === null ? 0 : Math.abs(candidate.price - currentPrice);
            const priceScore = currentPrice === null
                ? 0
                : Math.max(0, 2 - priceDistance / Math.max(currentPrice, 1));

            return {
                candidate,
                hasSemanticOverlap,
                semanticSharedTagCount,
                genericSharedTagCount,
                sameCategoryScore,
                priceScore,
                imageScore,
            };
        })
        .sort((left, right) => right.hasSemanticOverlap - left.hasSemanticOverlap
            || right.semanticSharedTagCount - left.semanticSharedTagCount
            || right.sameCategoryScore - left.sameCategoryScore
            || right.genericSharedTagCount - left.genericSharedTagCount
            || right.priceScore - left.priceScore
            || right.imageScore - left.imageScore
            || left.candidate.name.localeCompare(right.candidate.name))
        .slice(0, limit)
        .map((entry) => entry.candidate);

    return { items: relatedItems, error: null };
}


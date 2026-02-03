import { createServer } from "./server";
import type { ItemType } from "@/types/itemType";
import type { CategoryType } from "@/types/categoryType";

export async function getAllItems(){

    const supabase = await createServer();
    const {data: items, error} = await supabase.from('items').select('*, categories(name) -> category_name').eq('is_active', true).eq('is_deleted', false).order('name', {ascending: true});

    return {items, error}
}

export async function getCategory(category: string): Promise<Partial<CategoryType> | null> {

    const supabase = await createServer();
    
    const { data, error } = await supabase.from('categories').select('id, name').eq('name', category).limit(1);

    if(error){
        console.error('Error fetching category', error);
        return null
    }

    if(!data || data.length === 0) return null;

    return data[0]

}

export async function getAllCategories(){
    const supabase = await createServer();
    const {data: categories, error} = await supabase.from('categories').select('*').eq('is_active', true).eq('is_deleted', false).order('name', {ascending: true});

    if(error){
        console.error('Error fetching categories', error);
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

    const {data: items, error} = await supabase.from('items').select('*').eq('category_id', cat.id)

    return { items: items ?? [], error}
}


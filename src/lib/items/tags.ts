'use server'

import { createServer } from "@/lib/supabase/server";
import type { ItemType, TagType } from "@/types/itemType";
import { logServerError } from "@/lib/logging/server";

type ItemTagRow = {
    item_id: string
    tag_id: string
    tags: {
        id: string
        name: string
        slug: string
        description?: string
    }[] | null
}

type TaggedItemRow = {
    items: ItemType[] | null
}

export async function getAllTags() {
    const supabase = await createServer();
    
    const { data: tags, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true });

    if(error) {
        await logServerError('tags.getAllTags', error);
        return { tags: [] };
    }

    return { tags: tags as TagType[] };
}

export async function createTag(name: string, description?: string) {
    const supabase = await createServer();
    
    // Create slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const { data: tag, error } = await supabase
        .from('tags')
        .insert([{ name, slug, description }])
        .select()
        .single();

    if(error) {
        await logServerError('tags.createTag', error, { name });
        throw new Error(`Failed to create tag: ${error.message}`);
    }

    return tag as TagType;
}

export async function updateTag(id: string, name: string, description?: string) {
    const supabase = await createServer();
    
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const { data: tag, error } = await supabase
        .from('tags')
        .update({ name, slug, description })
        .eq('id', id)
        .select()
        .single();

    if(error) {
        await logServerError('tags.updateTag', error, { id, name });
        throw new Error(`Failed to update tag: ${error.message}`);
    }

    return tag as TagType;
}

export async function deleteTag(id: string) {
    const supabase = await createServer();
    
    const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);

    if(error) {
        await logServerError('tags.deleteTag', error, { id });
        throw new Error(`Failed to delete tag: ${error.message}`);
    }
}

export async function addTagToItem(itemId: string, tagId: string) {
    const supabase = await createServer();
    
    const { error } = await supabase
        .from('items_tags')
        .insert([{ item_id: itemId, tag_id: tagId }]);

    if(error) {
        if(error.code === '23505') { // Unique constraint violation
            return; // Tag already added to item
        }
        await logServerError('tags.addTagToItem', error, { itemId, tagId });
        throw new Error(`Failed to add tag: ${error.message}`);
    }
}

export async function removeTagFromItem(itemId: string, tagId: string) {
    const supabase = await createServer();
    
    const { error } = await supabase
        .from('items_tags')
        .delete()
        .eq('item_id', itemId)
        .eq('tag_id', tagId);

    if(error) {
        await logServerError('tags.removeTagFromItem', error, { itemId, tagId });
        throw new Error(`Failed to remove tag: ${error.message}`);
    }
}

export async function getItemTags(itemId: string) {
    const supabase = await createServer();
    
    const { data: itemTags, error } = await supabase
        .from('items_tags')
        .select('item_id, tag_id, tags(id, name, slug, description)')
        .eq('item_id', itemId);

    if(error) {
        await logServerError('tags.getItemTags', error, { itemId });
        return { tags: [] };
    }

    return { 
        tags: ((itemTags || []) as unknown as ItemTagRow[])
            .map((it) => ({
                id: it.tags?.[0]?.id,
                name: it.tags?.[0]?.name,
                slug: it.tags?.[0]?.slug,
                description: it.tags?.[0]?.description,
            }))
            .filter((tag) => Boolean(tag.id && tag.name && tag.slug)) as TagType[]
    };
}

export async function getItemsByTag(tagSlug: string) {
    const supabase = await createServer();
    
    const { data: items, error } = await supabase
        .from('items_tags')
        .select(`
            item_id,
            tag_id,
            tags!inner(slug),
            items (
                id,
                category_id,
                name,
                description,
                price,
                quantity,
                meta_title,
                meta_description,
                is_active,
                is_deleted,
                created_at,
                updated_at,
                item_images(*),
                categories(name),
                items_tags(item_id, tag_id, tags(id, name, slug, description))
            )
        `)
        .eq('tags.slug', tagSlug);

    if(error) {
        await logServerError('tags.getItemsByTag', error, { tagSlug });
        return { items: [] };
    }

    // Filter by tag slug (would normally be done in the query but shown here for clarity)
    const filteredItems = ((items || []) as unknown as TaggedItemRow[])
        .map((item) => item.items?.[0] ?? null)
        .filter((item): item is ItemType => Boolean(item));

    return { items: filteredItems };
}

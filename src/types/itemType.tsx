export type ItemImage = {
    id: string
    item_id: string
    image_url: string
    storage_path?: string
    sort_order?: number
    is_thumbnail: boolean
    alt_text?: string | null
    created_at?: string
}

export type ItemTag = {
    item_id?: string
    tag_id: string
    tags: {
        id: string
        name: string
        slug: string
        description?: string
    }
}

export type ItemType = {
    id: string
    category_id: string | null
    name: string
    description: string | null
    meta_title?: string | null
    meta_description?: string | null
    price: number
    quantity: number
    is_active: boolean
    is_deleted: boolean
    created_at: string
    updated_at: string
    item_images: ItemImage[]
    categories: { name: string } | null
    items_tags?: ItemTag[]
}

export type ProductFormValues = {
    name: string
    price: number
    category_id: string | null
    description: string
    meta_title: string
    meta_description: string
}

export type TagType = {
    id: string
    name: string
    slug: string
    description?: string
    created_at: string
    updated_at: string
}
export type ItemType = {
    id: string
    category_id: string
    name: string
    description: string
    price: number
    quantity: number
    is_active: boolean
    is_deleted: boolean
    created_at: string
    updated_at: string
    item_images: [{id: string, item_id: string, image_url: string, is_thumbnail: boolean}],
    categories: { name: string}
}
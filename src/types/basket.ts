export type BasketImage = {
    image_url: string;
    is_thumbnail: boolean;
};

export type BasketProduct = {
    name: string;
    price: number;
    item_images: BasketImage[];
};

export type BasketItem = {
    id: string;
    basket_id: string;
    quantity: number;
    items: BasketProduct;
};

'use client'

import BasketItemComponent from "./basketItemComponent"
import type { BasketItem } from "@/types/basket";

type BasketListComponentProps = {
    basket: BasketItem[];
    setItemQuantity: (basket_id: string, id: string, qty: number) => Promise<void> | void;
    removeBasketItem: (basket_id: string, id: string) => Promise<void> | void;
};

export default function BasketListComponent({basket, setItemQuantity, removeBasketItem}: BasketListComponentProps){

    return (<>
        {basket.map((item) => (
            <BasketItemComponent key={item.id} item={item} setItemQuantity={setItemQuantity} removeBasketItem={removeBasketItem}/>
        ))}
    </>)
}

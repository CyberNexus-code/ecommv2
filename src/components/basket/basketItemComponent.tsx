'use client'

import Image from "next/image";
import { useState } from "react"
import type { BasketItem } from "@/types/basket";

type BasketItemComponentProps = {
    item: BasketItem;
    setItemQuantity: (basket_id: string, id: string, qty: number) => Promise<void> | void;
    removeBasketItem: (basket_id: string, id: string) => Promise<void> | void;
};

export default function BasketItemComponent({item, setItemQuantity, removeBasketItem}: BasketItemComponentProps){

    const [quantity, setQuantity] = useState(item.quantity)

    async function min(){
        if(quantity > 1){
            const newQuantity = quantity - 1
            setQuantity(newQuantity);
            await setItemQuantity(item.basket_id, item.id, newQuantity)
        }
    }

    async function add(){
        const newQuantity = quantity + 1
        setQuantity(newQuantity);
        await setItemQuantity(item.basket_id, item.id, newQuantity)
    }

    const images = item.items.item_images;
    const thumbnail = images?.find((i) => i.is_thumbnail === true)

    return <>
    <div className="flex flex-col w-full items-center justify-between gap-4 rounded-2xl border border-rose-100 bg-white p-3 shadow-[0_8px_24px_-18px_rgba(190,24,93,0.6)] md:flex-row">
        <div className="flex w-full items-center gap-3">
            <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-rose-50">
                {thumbnail ? (
                    <Image src={thumbnail.image_url} alt={thumbnail.alt_text?.trim() || item.items.name} fill className="object-cover" sizes="80px" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-rose-400">Image</div>
                )}
            </div>
            <div className="flex flex-col justify-center">
                <h2 className="font-medium text-rose-950">{item.items.name}</h2>
                <p className="text-sm text-stone-600">Price: R {item.items.price.toFixed(2)}</p>
            </div> 
        </div>
        <div className="flex w-full items-center justify-between gap-2">
            <div className="flex items-center">
                <div className="flex items-center rounded-full bg-amber-100 p-1">
                        <button onClick={min} className="h-8 w-8 rounded-full bg-amber-300 text-base font-semibold text-amber-900 transition hover:bg-amber-400">-</button>
                        <p className="w-10 text-center text-sm font-semibold text-amber-900">{quantity}</p>
                        <button onClick={add} className="h-8 w-8 rounded-full bg-amber-300 text-base font-semibold text-amber-900 transition hover:bg-amber-400">+</button>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="m-auto min-w-18 text-right">
                    <h3 className="font-semibold text-rose-700">R {(quantity * item.items.price).toFixed(2)}</h3>
                </div>
                <div className="p-1">
                    <button onClick={() => removeBasketItem(item.basket_id, item.id)} aria-label={`Remove ${item.items.name}`} className="rounded-md border border-rose-200 px-2 py-1 text-sm font-medium text-rose-500 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700">Remove</button>
                </div>
            </div>
        </div>
    </div>
    </>
}

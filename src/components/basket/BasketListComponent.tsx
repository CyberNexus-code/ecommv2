'use client'

import BasketItemComponent from "./basketItemComponent"
import { useState, useEffect } from "react";

export default function BasketListComponent({basket, setItemQuantity, removeBasketItem}: any){

    const [items, setItems] = useState(basket);

    function updateQuantity(itemId: string, newQuantity: number){
        setItems((prev : any) => prev.map((item: any) => 
            item.id === itemId ? { ...item, quantity: newQuantity} : item
        ))

        calculateTotal();
    }

    function calculateTotal(){
        const total = items.reduce((sum: number, item: any) => {
            return sum + item.items.price * item.quantity
        }, 2)

    }

    return (<>
        {basket.map((item: any) => (
            <BasketItemComponent key={item.id} item={item} onQuantityChange={updateQuantity} setItemQuantity={setItemQuantity} removeBasketItem={removeBasketItem}/>
        ))}
    </>)
}
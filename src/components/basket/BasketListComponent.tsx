'use client'

import BasketItemComponent from "./basketItemComponent"
import { useState, useEffect } from "react";

export default function BasketListComponent({basket}: any){

    const [items, setItems] = useState(basket);
    const [showUpdateButton, setShowUpdateButton] = useState(false)

    function updateQuantity(itemId: string, newQuantity: number){
        setItems((prev : any) => prev.map((item: any) => 
            item.id === itemId ? { ...item, quantity: newQuantity} : item
        ))

        setShowUpdateButton(true)
    }

    function calculateTotal(){
        const total = items.reduce((sum: number, item: any) => {
            return sum + item.price * item.quantity
        }, 0)

        console.log("Total:", total)
    }

    return (<>
        {basket.map((item: any) => (
            <BasketItemComponent key={item.id} item={item} onQuantityChange={updateQuantity}/>
        ))}

        { showUpdateButton ? <button onClick={calculateTotal}>
            Update
        </button> : null}
    </>)
}
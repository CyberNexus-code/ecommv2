'use client'

import { useState, useEffect } from "react"

export default function BasketItemComponent({item, onQuantityChange}: any){

    const [quantity, setQuantity] = useState(item.quantity)

    function min(){
        if(quantity > 1){
            const newQuantity = quantity - 1
            setQuantity(newQuantity);
            onQuantityChange(item.id, newQuantity);
        }
    }

    function add(){
        const newQuantity = quantity + 1
        setQuantity(newQuantity);
        onQuantityChange(item.id. newQuantity)
    }

    const images = item.items.item_images;
    const thumbnail = images?.find((i: any) => i.is_thumbnail === true)

    return <>
    <div className="flex">
        <div className="flex w-full gap-2">
            <div className="w-20 h-20 rounded-sm">
                {thumbnail ? (<img className="object-fill h-full w-full overflow-hidden" src={thumbnail.image_url}></img>) : <div className="flex justify-center items-center text-gray-200 bg-gray-400 w-full h-full overflow-hidden">Image</div>}
            </div>
            <div className="flex flex-col justify-center">
                <h2>{item.items.name}</h2>
                <p>Price: R {item.items.price}</p>
            </div> 
        </div>
        <div className="flex w-full justify-between">
            <div className="flex items-center">
                <div className="flex rounded-full px-1 w-25 justify-between">
                        <button onClick={min} className="bg-yellow-300 p2 rounded-full w-6">-</button>
                        <p className="text-shadow-sm text0shadow-black">{quantity}</p>
                        <button onClick={add} className="bg-yellow-300 p2 rounded-full w-6">+</button>
                </div>
            </div>
            <div className="flex">
                <div className="m-auto">
                    <h3>{(quantity * item.items.price).toFixed(2)}</h3>
                </div>
                <div className="p-1">
                    <button className="cursor-pointer hover:text-rose-400">x</button>
                </div>
            </div>
        </div>
    </div>
    </>
}
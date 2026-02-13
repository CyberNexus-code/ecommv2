'use client'

import type { ItemType } from "@/types/itemType";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { addToBasket } from "@/lib/supabase/basket";

type ProductCardProps = { item: ItemType };

export default function ProductCard( {item} : ProductCardProps)  {

    const supabase = createClient()

    const [openModal, setOpenModal ] = useState(false);
    const [loading, setLoading ] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [itemID, setItemID ] = useState(item.id);
    const [thumbnail, setThumbnail] = useState<string | null>(null);

    function min(){
        if(quantity > 1){
            setQuantity(quantity - 1);
        }
    }

    function add(){
        setQuantity(quantity + 1);
    }

    useEffect(() => {
        if(item){
            const thumbImage = item.item_images.find(i => i.is_thumbnail === true)
            console.log(thumbImage?.image_url)
            if(thumbImage){
                setThumbnail(thumbImage?.image_url);
            }
        }
    },[])


    // const addToBasket = async () => {
    //     try {
    //         setLoading(true)

    //         const { data: { session }} = await supabase.auth.getSession();
    
    //         const res = await fetch('/api/basket/add', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json', ...(session?.access_token && {'Authorization': `Bearer ${session.access_token}`}
    //         )},
    //         credentials: "include",
    //         body: JSON.stringify({ itemId: item.id, quantity})
    //         })

    //         console.log(res)
    
    //         if(!res.ok){
    //              const errorData = await res.json();
    //             throw new Error(errorData.error || 'Failed to add item to basket');
    //         }
    //     }catch(err){
    //         console.error(err);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    //console.log(itemID)


  return (
    <>
        <div className="w-full">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col">
                {/* Image */}
                <div className="flex-[3] overflow-hidden cursor-pointer bg-white" onClick={() => setOpenModal(true)}>
                    <div className="flex flex-col h-full justify-center items-center">
                        {thumbnail ? (<img className="object-cover w-full h-full" src={thumbnail}></img>) : (<h1 className="flex h-full items-center justify-center text-gray-500">Image</h1>)}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-[2] p-4 flex flex-col justify-between">
                <div>
                    <h2 className="text-lg font-semibold line-clamp-2">
                    {item.name}
                    </h2>
                    <p className="text-sm text-gray-600 line-clamp-2">
                    {item.description}
                    </p>
                </div>
                    <span className="font-bold text-lg">
                    R{item.price.toFixed(2)}
                    </span>

                <div className="flex items-center justify-between mt-3">
                    <div className="flex bg-gray-200 rounded-2xl p-1">
                        <button onClick={min} className="bg-yellow-300 p2 rounded-xl w-6">-</button>
                        <p className="mx-4">{quantity}</p>
                        <button onClick={add} className="bg-yellow-300 p2 rounded-xl w-6">+</button>
                    </div>
                    <button onClick={async () => {await addToBasket(itemID, quantity); setQuantity(1)}} className="rounded-lg bg-rose-700 px-4 py-2 text-sm text-white">
                    Add to cart
                    </button>
                </div>
                </div>
            </div>

        </div>

        {openModal && (
            <div>
                
            </div>
        )}
    </>
  );
}

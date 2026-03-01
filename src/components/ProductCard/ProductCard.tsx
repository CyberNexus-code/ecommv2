'use client'

import Image from "next/image";
import type { ItemType } from "@/types/itemType";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { addToBasket } from "@/lib/baskets/basket";

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
    },[item])

  return (
    <>
        <div className="flex flex-col h-full w-full">
            <div className="h-full rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col hover:shadow-md border border-transparent hover:border-white">
                {/* Image */}
                <div className="relative aspect-[4/5] w-full overflow-hidden cursor-pointer bg-white" onClick={() => setOpenModal(true)}>
                        {thumbnail ? (<Image src={thumbnail} alt={item.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 25vw"/>) : 
                        (
                        <div className="flex h-full items-center justify-center text-gray-500">
                            Image
                        </div>
                        )}
                    
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-4 justify-between">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white p-6 rounded-xl">
            Modal Content
            <button onClick={() => setOpenModal(false)}>Close</button>
            </div>
        </div>
        )}
    </>
  );
}

'use client'

import Image from "next/image";
import type { ItemType } from "@/types/itemType";
import { useMemo, useState } from "react";
import { addToBasket } from "@/lib/baskets/basket";

type ProductCardProps = { item: ItemType };

export default function ProductCard({ item }: ProductCardProps) {
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    const thumbnail = useMemo(() => {
        return item.item_images.find((img) => img.is_thumbnail)?.image_url ?? null;
    }, [item.item_images]);

    function min() {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    }

    function add() {
        setQuantity(quantity + 1);
    }

    async function handleAddToCart() {
        try {
            setAdding(true);
            await addToBasket(item.id, quantity);
            setQuantity(1);
        } finally {
            setAdding(false);
        }
    }

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-[0_8px_24px_-18px_rgba(190,24,93,0.6)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-20px_rgba(190,24,93,0.55)]">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-rose-50">
                {thumbnail ? (
                    <Image
                        src={thumbnail}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 25vw"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-rose-400">
                        No image
                    </div>
                )}
                <div className="absolute left-3 top-3 rounded-full bg-rose-700/95 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    Handmade
                </div>
            </div>

            <div className="flex flex-1 flex-col justify-between p-4">
                <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-500">
                        {item.categories?.name?.replace("-", " ") ?? "Collection"}
                    </p>
                    <h2 className="line-clamp-2 text-lg font-semibold text-rose-950">{item.name}</h2>
                    <p className="line-clamp-2 text-sm text-stone-600">{item.description}</p>
                </div>

                <div className="mt-5 space-y-3">
                    <span className="block text-xl font-bold text-rose-700">R{item.price.toFixed(2)}</span>

                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center rounded-full bg-amber-100 p-1">
                            <button
                                onClick={min}
                                aria-label={`Decrease quantity for ${item.name}`}
                                className="h-8 w-8 rounded-full bg-amber-300 text-base font-semibold text-amber-900 transition hover:bg-amber-400"
                            >
                                -
                            </button>
                            <p className="w-10 text-center text-sm font-semibold text-amber-900">{quantity}</p>
                            <button
                                onClick={add}
                                aria-label={`Increase quantity for ${item.name}`}
                                className="h-8 w-8 rounded-full bg-amber-300 text-base font-semibold text-amber-900 transition hover:bg-amber-400"
                            >
                                +
                            </button>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            disabled={adding}
                            className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {adding ? "Adding..." : "Add to cart"}
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}

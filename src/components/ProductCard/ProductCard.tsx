'use client'

import Image from "next/image";
import Link from "next/link";
import type { ItemType } from "@/types/itemType";
import { useMemo, useState } from "react";
import { addToBasket } from "@/lib/baskets/basket";
import { getProductPath } from "@/lib/items/routes";

type ProductCardProps = { item: ItemType };

export default function ProductCard({ item }: ProductCardProps) {
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    const thumbnail = useMemo(() => {
        return item.item_images.find((img) => img.is_thumbnail) ?? item.item_images[0] ?? null;
    }, [item.item_images]);
    const imageCount = item.item_images.length;

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
            <Link href={getProductPath(item)} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2">
                <div className="relative aspect-[4/3.8] w-full overflow-hidden bg-rose-50">
                    {thumbnail ? (
                        <Image
                            src={thumbnail.image_url}
                            alt={thumbnail.alt_text?.trim() || item.meta_title?.trim() || item.name}
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
                    {imageCount > 1 ? (
                        <div className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-rose-800 shadow-sm">
                            {imageCount} photos
                        </div>
                    ) : null}
                </div>

                <div className="flex flex-1 flex-col justify-between p-4">
                    <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-500">
                            {item.categories?.name?.replace("-", " ") ?? "Collection"}
                            </p>
                            <span className="shrink-0 text-lg font-bold text-rose-700">R{item.price.toFixed(2)}</span>
                        </div>
                        <h2 className="line-clamp-2 text-base font-semibold text-rose-950 md:text-lg group-hover:text-rose-800">{item.name}</h2>
                        <p className="line-clamp-2 text-sm leading-5 text-stone-600">{item.description}</p>
                        <p className="text-sm font-medium text-rose-700">View product details and gallery</p>
                    </div>
                </div>
            </Link>

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-rose-100 px-4 pb-4 pt-3">
                        <div className="flex items-center rounded-full bg-amber-100 p-1">
                            <button
                                type="button"
                                onClick={min}
                                aria-label={`Decrease quantity for ${item.name}`}
                                className="h-7 w-7 rounded-full bg-amber-300 text-sm font-semibold text-amber-900 transition hover:bg-amber-400"
                            >
                                -
                            </button>
                            <p className="w-8 text-center text-sm font-semibold text-amber-900">{quantity}</p>
                            <button
                                type="button"
                                onClick={add}
                                aria-label={`Increase quantity for ${item.name}`}
                                className="h-7 w-7 rounded-full bg-amber-300 text-sm font-semibold text-amber-900 transition hover:bg-amber-400"
                            >
                                +
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={adding}
                            className="rounded-xl bg-rose-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {adding ? "Adding..." : "Add to cart"}
                        </button>
                </div>
        </article>
    );
}

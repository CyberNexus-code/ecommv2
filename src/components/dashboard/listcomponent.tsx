'use client'

import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { TrashIcon, PlusCircleIcon } from "@heroicons/react/24/outline"
import dynamic from "next/dynamic"
import { Suspense } from "react"
const EditProductModal = dynamic(() => import("./editproductmodal"), { suspense: true })
const EditCategoriesModal = dynamic(() => import("./editcategoriesmodal"), { suspense: true })
const AlertModal = dynamic(() => import("./alertModal"), { suspense: true })
const ImageModal = dynamic(() => import("./imageModal"), { suspense: true })
import { markProductPricingReviewed } from '@/app/_actions/productActions'
import type { CategoryType } from "@/types/categoryType"
import type { ItemType, TagType } from "@/types/itemType"

type ProductListProps = ItemType & {
    type: "products"
    catList: CategoryType[]
    allTags: TagType[]
    priceReviewWindowDays: number
}

type CategoryListProps = CategoryType & {
    type: "categories"
}

type ListComponentProps = {
    props: ProductListProps | CategoryListProps
}

export default function ListComponent({props}: ListComponentProps){
    const router = useRouter()
    const [showModal, setShowModal] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [showCatModel, setShowCatModal] = useState(false);
    const [showCatAlertModal, setShowCatAlertModal] = useState(false);
    const [showImageModule, setShowImageModal] = useState(false)
    const [markingPriceReviewed, setMarkingPriceReviewed] = useState(false)

    const productThumbnail = props.type === "products"
        ? props.item_images.find((image) => image.is_thumbnail) ?? props.item_images[0] ?? null
        : null;

        function getPricingReviewState(product: ProductListProps) {
                const reviewedAt = new Date(product.price_reviewed_at)
                const nextReview = new Date(reviewedAt)
            nextReview.setDate(nextReview.getDate() + product.priceReviewWindowDays)
                const now = new Date()
                const daysUntilReview = Math.ceil((nextReview.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

                return {
                        isOverdue: daysUntilReview <= 0,
                        message: daysUntilReview <= 0
                                ? `Price review overdue by ${Math.abs(daysUntilReview)} day${Math.abs(daysUntilReview) === 1 ? '' : 's'}`
                                : `Review pricing in ${daysUntilReview} day${daysUntilReview === 1 ? '' : 's'}`,
                }
        }

    if(props.type === "products"){

            const pricingReview = getPricingReviewState(props)

      const handleThumbnail = (url: string) => {
        return url;
      }

            async function handleMarkPricingReviewed() {
                setMarkingPriceReviewed(true)
                try {
                    await markProductPricingReviewed(props.id)
                    router.refresh()
                } finally {
                    setMarkingPriceReviewed(false)
                }
            }

        return (
            <>
             <div key={props.id} className="my-4 flex flex-col gap-3 rounded-xl bg-white p-3 shadow-sm transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 gap-3 sm:gap-4">
                                <div className="flex h-20 w-20 shrink-0 rounded-md cursor-pointer" onClick={() => setShowImageModal(true)}>
                                    {productThumbnail ?  <div className="relative h-full w-full overflow-hidden rounded-md"><Image className="object-cover" src={productThumbnail.image_url} alt={productThumbnail.alt_text?.trim() || props.name} fill sizes="80px" /></div> : <div className="flex h-full w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-400 text-gray-400"><PlusCircleIcon className="size-6"/></div>}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="break-words text-sm font-semibold text-stone-900 sm:text-base">{props.name}</h2>
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${props.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'}`}>{props.is_active ? 'Live' : 'Hidden'}</span>
                                    </div>
                                    <div className="mt-1 text-sm text-stone-600">Price: R{props.price}</div>
                                    <div className="text-sm text-stone-600 break-words">Category: {props.categories?.name}</div>
                                    {pricingReview.isOverdue ? <div className="mt-1 text-xs text-amber-700">{pricingReview.message}</div> : null}
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                {pricingReview.isOverdue ? <button onClick={handleMarkPricingReviewed} disabled={markingPriceReviewed} className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60">{markingPriceReviewed ? 'Saving...' : 'Mark price reviewed'}</button> : null}
                                <button onClick={() => setShowModal(true)} className="rounded-md border border-rose-700 bg-white px-3 py-1.5 text-sm text-rose-700 cursor-pointer hover:bg-rose-700 hover:text-white">Edit</button>
                                <button onClick={() => setShowAlertModal(true)} className="rounded-md border border-rose-700 p-1.5 text-rose-700 cursor-pointer hover:bg-rose-700 hover:text-white"><TrashIcon className="size-5 sm:size-6"/></button>
                            </div>    
                        </div>

                                {showModal && (
                                    <Suspense fallback={<div className="flex items-center justify-center p-8"><span>Loading...</span></div>}>
                                        <EditProductModal product={props} onClose={() => setShowModal(false)} />
                                    </Suspense>
                                )}
                                {showAlertModal && (
                                    <Suspense fallback={<div className="flex items-center justify-center p-8"><span>Loading...</span></div>}>
                                        <AlertModal props={props} onClose={() => setShowAlertModal(false)}/>
                                    </Suspense>
                                )}
                                {showImageModule && (
                                    <Suspense fallback={<div className="flex items-center justify-center p-8"><span>Loading...</span></div>}>
                                        <ImageModal product={{props}} onClose={() => setShowImageModal(false)} setThumbId={handleThumbnail}/>
                                    </Suspense>
                                )}
            </>
        )
    }

    if(props.type === "categories"){
        return (
            <>
                <div className="flex items-center h-[50px] justify-between gap-2 px-2 my-4 bg-white rounded-lg shadow-sm cursor-pointer hover:bg-gray-100">
                    <div>
                        <h2 className="">{props.name}</h2>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setShowCatModal(true)} className="bg-white border-rose-700 border-1 text-rose-700 rounded-md px-3 py-1 cursor-pointer hover:bg-rose-700 hover:text-white">Edit</button>
                        <button onClick={() => setShowCatAlertModal(true)} className="border border-rose-700 p-1 rounded-sm text-rose-700 cursor-pointer hover:text-white hover:bg-rose-700"><TrashIcon className="size-6"/></button>
                    </div>
                </div>

                                {showCatModel && (
                                    <Suspense fallback={<div className="flex items-center justify-center p-8"><span>Loading...</span></div>}>
                                        <EditCategoriesModal category={props} onClose={() => setShowCatModal(false)} />
                                    </Suspense>
                                )}
                                {showCatAlertModal && (
                                    <Suspense fallback={<div className="flex items-center justify-center p-8"><span>Loading...</span></div>}>
                                        <AlertModal props={props} onClose={() => setShowCatAlertModal(false)}/>
                                    </Suspense>
                                )}
            </>
        )
    }
}
'use client'

import Image from "next/image"
import { useState } from "react"
import { TrashIcon, PlusCircleIcon } from "@heroicons/react/24/outline"
import EditProductModal from "./editproductmodal"
import EditCategoriesModal from "./editcategoriesmodal"
import AlertModal from "./alertModal";
import ImageModal from "./imageModal"
import type { CategoryType } from "@/types/categoryType"
import type { ItemType, TagType } from "@/types/itemType"

type ProductListProps = ItemType & {
    type: "products"
    catList: CategoryType[]
    allTags: TagType[]
}

type CategoryListProps = CategoryType & {
    type: "categories"
}

type ListComponentProps = {
    props: ProductListProps | CategoryListProps
}

export default function ListComponent({props}: ListComponentProps){
    const [showModal, setShowModal] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [showCatModel, setShowCatModal] = useState(false);
    const [showCatAlertModal, setShowCatAlertModal] = useState(false);
    const [showImageModule, setShowImageModal] = useState(false)

    const productThumbnail = props.type === "products"
        ? props.item_images.find((image) => image.is_thumbnail) ?? props.item_images[0] ?? null
        : null;

    if(props.type === "products"){

      const handleThumbnail = (url: string) => {
        return url;
      }

        return (
            <>
             <div key={props.id} className="my-4 flex flex-col gap-3 rounded-xl bg-white p-3 shadow-sm transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 gap-3 sm:gap-4">
                                <div className="flex h-20 w-20 shrink-0 rounded-md cursor-pointer" onClick={() => setShowImageModal(true)}>
                                    {productThumbnail ?  <div className="relative h-full w-full overflow-hidden rounded-md"><Image className="object-cover" src={productThumbnail.image_url} alt={productThumbnail.alt_text?.trim() || props.name} fill sizes="80px" /></div> : <div className="flex h-full w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-400 text-gray-400"><PlusCircleIcon className="size-6"/></div>}
                                </div>
                                <div className="min-w-0">
                                    <h2 className="break-words text-sm font-semibold text-stone-900 sm:text-base">{props.name}</h2>
                                    <div className="mt-1 text-sm text-stone-600">Price: R{props.price}</div>
                                    <div className="text-sm text-stone-600 break-words">Category: {props.categories?.name}</div>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                <button onClick={() => setShowModal(true)} className="rounded-md border border-rose-700 bg-white px-3 py-1.5 text-sm text-rose-700 cursor-pointer hover:bg-rose-700 hover:text-white">Edit</button>
                                <button onClick={() => setShowAlertModal(true)} className="rounded-md border border-rose-700 p-1.5 text-rose-700 cursor-pointer hover:bg-rose-700 hover:text-white"><TrashIcon className="size-5 sm:size-6"/></button>
                            </div>    
                        </div>

                {showModal && <EditProductModal product={props} onClose={() => setShowModal(false)} />}
                {showAlertModal && <AlertModal props={props} onClose={() => setShowAlertModal(false)}/>}
                {showImageModule && <ImageModal product={{props}} onClose={() => setShowImageModal(false)} setThumbId={handleThumbnail}/>}
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

                {showCatModel && <EditCategoriesModal category={props} onClose={() => setShowCatModal(false)} />}
                {showCatAlertModal && <AlertModal props={props} onClose={() => setShowCatAlertModal(false)}/>}
            </>
        )
    }
}
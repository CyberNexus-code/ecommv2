'use client'

import { useEffect, useState } from "react"
import { TrashIcon, PlusCircleIcon } from "@heroicons/react/24/outline"
import EditProductModal from "./editproductmodal"
import EditCategoriesModal from "./editcategoriesmodal"
import AlertModal from "./alertModal";
import ImageModal from "./imageModal"

export default function ListComponent({props}: {props: any}){
    const [showModal, setShowModal] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [showCatModel, setShowCatModal] = useState(false);
    const [showCatAlertModal, setShowCatAlertModal] = useState(false);
    const [productThumbnail, setProductThumbnail] = useState('')
    const [showImageModule, setShowImageModal] = useState(false)

    if(props.type === "products"){

        useEffect(() => {
            const thumbnail = props.item_images.find((i: any) => i.is_thumbnail)
            if(thumbnail){
                setProductThumbnail(thumbnail.image_url)
            }
        },[])

      const handleThumbnail = (url: string) => {
        if(url){
            setProductThumbnail(url)
        }else{
            setProductThumbnail('')
        }
      }

        return (
            <>
             <div key={props.id} className="flex flex-column justify-between border-b-1 border-gray-400 w-full">
                            <div className="flex gap-4 m-2">
                                <div className="flex w-20 rounded-md cursor-pointer" onClick={() => setShowImageModal(true)}>
                                    {productThumbnail ?  <img className="object--cover w-full h-full rounded-md" src={productThumbnail}></img> : <div className="flex flex-col w-full h-full rounded-md border-2 border-dashed border-gray-400 text-gray-400 justify-center items-center"><PlusCircleIcon className="size-6"/></div>}
                                </div>
                                <div>
                                    <h2 className="">{props.name}</h2>
                                    <div>Price: R{props.price}</div>
                                    <div>Category: {props.categories?.name}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setShowModal(true)} className="bg-white border-rose-700 border-1 text-rose-700 rounded-md px-3 py-1 cursor-pointer hover:bg-rose-700 hover:text-white">Edit</button>
                                <button onClick={() => setShowAlertModal(true)} className="border border-rose-700 p-1 rounded-sm text-rose-700 cursor-pointer hover:text-white hover:bg-rose-700"><TrashIcon className="size-6"/></button>
                            </div>    
                        </div>

                {showModal && <EditProductModal product={props} onClose={() => setShowModal(false)} />}
                {showAlertModal && <AlertModal props={props} onClose={() => setShowAlertModal(false)}/>}
                {showImageModule && <ImageModal product={{props}} onClose={() => setShowImageModal(false)} setThumbId={handleThumbnail}/>}
            </>
        )
    }

    if(props.type = "categories"){
        return (
            <>
                <div className="flex justify-between border-b-1 border-gray-400 w-full pb-2 my-5">
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
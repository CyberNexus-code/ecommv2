'use client'

import { PlusCircleIcon } from "@heroicons/react/24/outline"
import { useState, useEffect } from "react"
import { fetchImages } from "@/app/_actions/productActions";

export default function ImageModal({product, onClose}: {product: any,onClose: ()=>void}){
    const [images, setImages] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [activeImage, setActiveImage] =useState<any | null>(null)

    useEffect(() => {
        async function getImages(){
            const {images, error} = await fetchImages(product.id);

            if(!error) setImages(images || [])
            if(images?.length){
                setActiveImage(images.find((i: any) => i.is_thumbnail) || images[0]);
            }
        }

        getImages()

    },[product.id])

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(!e.target.files) return

        const files = Array.from(e.target.files);

        const newImages = files.map((file, index) => ({
            tempId: crypto.randomUUID(),
            file,
            previewUrl: URL.createObjectURL(file),
            is_thumbnail: images.length === 0 && index === 0
        }))

        setImages(prev => {
            const updated = [...prev, ...newImages]
            if(!activeImage) setActiveImage(updated[0])
            return updated
        })
    }

    const setThumbnail = (image: any) => {
        setImages(prev => prev.map(img => ({
            ...img, 
            is_thumbnail: img === image,
        })))
    }

    console.log("Images:", images)

    return (
        <>
        <div className="fixed inset-0 z-40 flex bg-black/30 backdrop-blur-xs">
            <div className="inset-0 z-50 bg-white m-auto rounded-md w-100">
                <div className="flex flex-col p-5">
                    <div>
                        <h1 className="">{product.name}</h1>
                    </div>
                    <div className="flex flex-col justify-center items-center p-5">
                        <div className="flex flex-col border-2 border-dashed border-gray-400 rounded-lg w-80 h-60 mb-2">
                            {activeImage ? (
                                <>
                                    <img src={activeImage.image_url || activeImage.previewUrl} className="w-full h-full object-contain rounded"></img>

                                    <label>
                                        <input type="checkbox" checked={activeImage.is_thumbnail} onChange={() => setThumbnail(activeImage)} />
                                    </label>
                                </>
                            ) : ( <span className="text-gray-400">Select an image</span>)}
                        </div>
                        <div className="flex flex border-2 border-dashed border-gray-400 rounded-md w-80 h-12">
                            {images.length > 0 ? <div className="flex justify-center items-center text-gray-400 border-2 border-dashed border-gray-400 w-10 m-1 rounded-sm cursor-pointer"></div> : null}
                            <input type="file" accept="image/*" multiple hidden id="image-upload" onChange={handleFileUpload}/>
                            <button onClick={() => document.getElementById('image-upload')?.click()} className="flex justify-center items-center text-gray-400 border-2 border-dashed border-gray-400 w-10 m-1 rounded-sm cursor-pointer"><PlusCircleIcon className="size-6" /></button>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button className='border border-rose-700 text-rose-700 rounded-md px-2 py-1 hover:bg-rose-700 hover:text-white' onClick={onClose}>Cancel</button>
                        <button>save</button>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}
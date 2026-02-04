'use client'

import { PlusCircleIcon } from "@heroicons/react/24/outline"
import { useState, useEffect } from "react"
import { fetchImages, saveProductImages } from "@/app/_actions/productActions";
import { createClient } from "@/lib/supabase/client";

export default function ImageModal({product, onClose}: {product: any,onClose: ()=>void}){
    const [images, setImages] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [activeImage, setActiveImage] =useState<any | null>(null)
    const [activeImageKey, setActiveImageKey] = useState<String | null>(null)

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

    useEffect(() => {
          return () => {
            images.forEach(img => {
                if( img.previewUrl) {
                    URL.revokeObjectURL(img.previewUrl)
                }
            })
        }
    }, [images])

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

    const getImageKey = (img: any) => img.id ?? img.tempId;

    const setThumbnail = (image: any) => {

        const key = getImageKey(image)

        setImages(prev => prev.map(img => ({
            ...img, 
            is_thumbnail: getImageKey(img) === key,
        })))

        setActiveImage((prev: any) => prev && getImageKey(prev) === key ? {...prev, is_thumbnail: true} : prev)
    }

    const handleSave = async () => {
        try{
            setUploading(true)

            const supabase = await createClient();

            const uploadedImages: {
                image_url: string,
                is_thumbnail: boolean
            }[] = []

            for (const img of images){
                if (!img.file) continue
                
                const filePath = `products/${product.id}/${crypto.randomUUID()}`;

                const { error: uploadError } =  await supabase.storage.from('product-images').upload(filePath, img.file)

                if(uploadError){
                    throw uploadError
                };

                const { data } = await supabase.storage.from('product-images').getPublicUrl(filePath)

                uploadedImages.push({
                    image_url: data.publicUrl,
                    is_thumbnail: img.is_thumbnail
                });

            }

            if(!images.some(img => img.is_thumbnail)){
                alert("Please select a thumbnail image")
                return
            }

            await saveProductImages({
                productId: product.id,
                images: images.map(img => ({
                    id: img.id,
                    image_url: img.image_url,
                    is_thumbnail: img.is_thumbnail
                }))
            })

            onClose()
        }finally{
            setUploading(false)
        }
    }

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
                            {/* This code below is to view the active image in the image viewer */}
                            {activeImage ? (
                                <>
                                    <img src={activeImage.image_url || activeImage.previewUrl} className="object--cover w-full h-full"></img>
                                </>
                            ) : ( <span className="text-gray-400">Select an image</span>)}
                        </div>
                        {activeImage ? ( <div className="flex justify-start w-full text-sm gap-1 text-gray-400">
                            <label>Set as Thumbnail:</label>
                            <input type="checkbox" checked={!!activeImage.is_thumbnail} onChange={() => setThumbnail(activeImage)}/>
                        </div>) : null }
                        <div className="flex flex border-2 border-dashed border-gray-400 rounded-md w-80 h-12">
                            {/* the code below is to show all uploaded images and select an image to view in the image viewer */}
                            {images.length > 0 ? 
                            (images?.map((i) => (<div onClick={() => setActiveImage(i)} key={getImageKey(i)} className="flex justify-center items-center text-gray-400 border-2 border-dashed border-gray-400 w-10 m-1 rounded-sm cursor-pointer"><img src={i.image_url ? i.image_url : i.previewUrl} className="object--cover w-full h-full"></img></div>))) 
                            : null}
                            <input type="file" accept="image/*" multiple hidden id="image-upload" onChange={handleFileUpload}/>
                            <button onClick={() => document.getElementById('image-upload')?.click()} className="flex justify-center items-center text-gray-400 border-2 border-dashed border-gray-400 w-10 m-1 rounded-sm cursor-pointer"><PlusCircleIcon className="size-6" /></button>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button className='border border-rose-700 text-rose-700 rounded-md px-2 py-1 hover:bg-rose-700 hover:text-white' onClick={onClose}>Cancel</button>
                        <button onClick={handleSave} className='border border-rose-700 text-white bg-rose-700 rounded-md px-2 py-1 hover:bg-rose-900 hover:text-rose-700'>{uploading ? "Saving..." : "Save"}</button>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}
'use client'

import { PlusCircleIcon } from "@heroicons/react/24/outline"
import { useState, useEffect } from "react"
import { fetchImages, saveProductImages, deleteImage } from "@/app/_actions/productActions";
import { createClient } from "@/lib/supabase/client";
import { convertToWebP } from "@/lib/imageHandler";

export default function ImageModal({product, onClose, setThumbId}: {product: any,onClose: ()=>void, setThumbId: (id: string)=>void}){
    const [images, setImages] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [activeImage, setActiveImage] =useState<any | null>(null)
    const [cancelState, setCancelState] = useState(false)

    console.log("active image:", activeImage)
    useEffect(() => {
        async function getImages(){
            const {images, error} = await fetchImages(product.props.id);

            if(!error) setImages(images || [])
            if(images?.length){
                setActiveImage(images.find((i: any) => i.is_thumbnail) || images[0]);
            }
        }
        getImages()
    },[product.props.id])

    useEffect(() => {
          return () => {
            images.forEach(img => {
                if( img.previewUrl) {
                    URL.revokeObjectURL(img.previewUrl)
                }
            })
        }
    }, [images])

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if(!e.target.files) return

        const files = Array.from(e.target.files);

        const newImages = await Promise.all(
            files.map(async (file, index) => {
                const webpfile = await convertToWebP(file);

                return {
                    tempId: crypto.randomUUID(),
                    file: webpfile,
                    previewUrl: URL.createObjectURL(webpfile),
                    is_thumbnail: images.length === 0 && index === 0
                }
            })
        )

        // const newImages = files.map((file, index) => ({
        //     tempId: crypto.randomUUID(),
        //     file,
        //     previewUrl: URL.createObjectURL(file),
        //     is_thumbnail: images.length === 0 && index === 0
        // }))

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

            const uploadedImages = []

            for (const img of images){
                if (img.image_url && !img.file) {
                    uploadedImages.push(img);
                    continue;
                }

                if(!img.file) continue;

                console.log(product.props.id)
                const filePath = `products/${product.props.id}/${crypto.randomUUID()}`;

                const { error: uploadError } =  await supabase.storage.from('product-images').upload(filePath, img.file)

                if(uploadError){
                    throw uploadError
                };

                const { data } = await supabase.storage.from('product-images').getPublicUrl(filePath)

                uploadedImages.push({
                    ...img,
                    image_url: data.publicUrl,
                    storage_path: filePath,
                    is_thumbnail: img.is_thumbnail,
                    file: undefined
                });

            }

            if(images.length > 0  && !images.some(img => img.is_thumbnail)){
                alert("Please select a thumbnail image")
                return
            }

            console.log("Images:",images)
            console.log("Uplaoded images:",uploadedImages)

            await saveProductImages({
                productId: product.props.id,
                images: uploadedImages.map(img => ({
                    id: img.id,
                    image_url: img.image_url,
                    storage_path: img.storage_path,
                    is_thumbnail: img.is_thumbnail
                }))
            })

            const thumbnail = uploadedImages.find(i => i.is_thumbnail)
            
            if(thumbnail){
                setThumbId(thumbnail.image_url);
            }else{
                setThumbId('')
            }
            onClose()

        }finally{
            setUploading(false)
        }
    }

    const handleDelete = async () => {
        if(!activeImage) return;

        console.log(activeImage)

        if(activeImage.id && activeImage.storage_path){
            console.log("Delete storage was called:", activeImage.storage_path)
            await deleteImage(activeImage.storage_path);
        }

        setImages(prev => {
            const updated = prev.filter(img => getImageKey(img) !== getImageKey(activeImage))

            if(updated.length === 0){
                setActiveImage(null);
                return [];
            }

            let hasThumbnail = updated.some(img => img.is_thumbnail);

            const finalImages = hasThumbnail ? updated : updated.map((img, idx) => ({...img, is_thumbnail: idx === 0}));

            setActiveImage(finalImages.find(i => i.is_thumbnail || finalImages[0]));

            return finalImages;
        });

        setCancelState(true);
        
    }

    return (
        <>
        <div className="fixed inset-0 z-40 flex bg-black/30 backdrop-blur-xs">
            <div className="inset-0 z-50 bg-white m-auto rounded-md w-100">
                <div className="flex flex-col p-5">
                    <div>
                        <h1 className="">{product.props.name}</h1>
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
                    <div className="flex justify-between">
                        <div className="flex justify-start">
                                <button className='border border-rose-700 text-white bg-rose-600 rounded-md px-2 py-1 hover:bg-rose-900 hover:text-rose-700' onClick={handleDelete}>Delete</button>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button className='border border-rose-700 text-rose-700 rounded-md px-2 py-1 hover:bg-rose-700 hover:text-white' onClick={onClose} disabled={cancelState ? true : false}>Cancel</button>
                            <button onClick={handleSave} className='border border-rose-700 text-white bg-rose-700 rounded-md px-2 py-1 hover:bg-rose-900 hover:text-rose-700'>{uploading ? "Saving..." : "Save"}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}
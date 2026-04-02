'use client'

import Image from "next/image";
import { PlusCircleIcon } from "@heroicons/react/24/outline"
import { useState, useEffect } from "react"
import { fetchImages, saveProductImages, deleteImage } from "@/app/_actions/productActions";
import { createClient } from "@/lib/supabase/client";
import { convertToWebP } from "@/lib/items/imageHandler";
import type { ItemType } from "@/types/itemType";

type EditableImage = {
    id?: string;
    tempId?: string;
    item_id?: string;
    image_url?: string;
    storage_path?: string;
    sort_order: number;
    is_thumbnail: boolean;
    alt_text: string;
    file?: File;
    previewUrl?: string;
    created_at?: string;
}

type ImageModalProps = {
    product: {
        props: ItemType;
    };
    onClose: ()=>void;
    setThumbId: (id: string)=>void;
}

export default function ImageModal({product, onClose, setThumbId}: ImageModalProps){
    const [images, setImages] = useState<EditableImage[]>([]);
    const [uploading, setUploading] = useState(false);
    const [activeImage, setActiveImage] =useState<EditableImage | null>(null)
    const [cancelState, setCancelState] = useState(false)

    useEffect(() => {
        async function getImages(){
            const {images, error} = await fetchImages(product.props.id);

            if(!error) {
                const typedImages = (images || []).map((image, index) => ({
                    ...image,
                    sort_order: image.sort_order ?? index,
                    alt_text: image.alt_text ?? product.props.meta_title ?? product.props.name,
                }));
                setImages(typedImages)
                if(typedImages.length){
                    setActiveImage(typedImages.find((i) => i.is_thumbnail) || typedImages[0]);
                }
            }
        }
        getImages()
    },[product.props.id, product.props.meta_title, product.props.name])

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
                    is_thumbnail: images.length === 0 && index === 0,
                    sort_order: images.length + index,
                    alt_text: product.props.meta_title ?? product.props.name,
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

    const getImageKey = (img: EditableImage) => img.id ?? img.tempId ?? img.image_url ?? crypto.randomUUID();

    const updateImage = (imageKey: string, updater: (image: EditableImage, index: number) => EditableImage) => {
        setImages((current) => current.map((image, index) => {
            if (getImageKey(image) !== imageKey) {
                return image;
            }

            return updater(image, index);
        }));
        setActiveImage((current) => {
            if (!current || getImageKey(current) !== imageKey) {
                return current;
            }

            return updater(current, 0);
        });
    }

    const setThumbnail = (image: EditableImage) => {

        const key = getImageKey(image)

        setImages(prev => prev.map(img => ({
            ...img, 
            is_thumbnail: getImageKey(img) === key,
        })))

        setActiveImage((prev) => prev && getImageKey(prev) === key ? {...prev, is_thumbnail: true} : prev)
    }

    const handleSave = async () => {
        try{
            setUploading(true)

            const supabase = await createClient();

            const uploadedImages: EditableImage[] = []

            for (let index = 0; index < images.length; index += 1){
                const img = images[index];
                if (img.image_url && !img.file) {
                    uploadedImages.push(img);
                    continue;
                }

                if(!img.file) continue;

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
                    sort_order: img.sort_order ?? index,
                    file: undefined
                });

            }

            if(images.length > 0  && !images.some(img => img.is_thumbnail)){
                alert("Please select a thumbnail image")
                return
            }

            await saveProductImages({
                productId: product.props.id,
                images: uploadedImages.map(img => ({
                    id: img.id,
                    image_url: img.image_url ?? '',
                    storage_path: img.storage_path ?? '',
                    is_thumbnail: img.is_thumbnail,
                    alt_text: img.alt_text,
                    sort_order: img.sort_order,
                }))
            })

            const thumbnail = uploadedImages.find(i => i.is_thumbnail)
            
            if(thumbnail){
                setThumbId(thumbnail.image_url ?? '');
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

        if(activeImage.id && activeImage.storage_path){
            await deleteImage(activeImage.storage_path);
        }

        setImages(prev => {
            const updated = prev.filter(img => getImageKey(img) !== getImageKey(activeImage))

            if(updated.length === 0){
                setActiveImage(null);
                return [];
            }

            const hasThumbnail = updated.some(img => img.is_thumbnail);

            const finalImages = hasThumbnail ? updated : updated.map((img, idx) => ({...img, is_thumbnail: idx === 0}));

            setActiveImage(finalImages.find((image) => image.is_thumbnail) ?? finalImages[0] ?? null);

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
                                    <div className="relative h-full w-full">
                                        <Image src={activeImage.image_url || activeImage.previewUrl || ''} alt={activeImage.alt_text || product.props.name} fill unoptimized className="object-cover" />
                                    </div>
                                </>
                            ) : ( <span className="text-gray-400">Select an image</span>)}
                        </div>
                        {activeImage ? ( <div className="flex justify-start w-full text-sm gap-1 text-gray-400">
                            <label>Set as Thumbnail:</label>
                            <input type="checkbox" checked={!!activeImage.is_thumbnail} onChange={() => setThumbnail(activeImage)}/>
                        </div>) : null }
                        {activeImage ? (
                            <div className="mt-3 w-full">
                                <label className="mb-1 block text-sm text-gray-600">Image Alt Text</label>
                                <input
                                    type="text"
                                    value={activeImage.alt_text}
                                    onChange={(event) => updateImage(getImageKey(activeImage), (image) => ({
                                        ...image,
                                        alt_text: event.target.value,
                                    }))}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    placeholder="Describe the image for accessibility and SEO"
                                />
                            </div>
                        ) : null}
                        <div className="flex flex border-2 border-dashed border-gray-400 rounded-md w-80 h-12">
                            {/* the code below is to show all uploaded images and select an image to view in the image viewer */}
                            {images.length > 0 ? 
                            (images?.map((i) => (<button type="button" onClick={() => setActiveImage(i)} key={getImageKey(i)} className="relative m-1 flex w-10 items-center justify-center overflow-hidden rounded-sm border-2 border-dashed border-gray-400 text-gray-400 cursor-pointer">{i.image_url || i.previewUrl ? <Image src={i.image_url || i.previewUrl || ''} alt={i.alt_text || product.props.name} fill unoptimized className="object-cover" /> : null}</button>))) 
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
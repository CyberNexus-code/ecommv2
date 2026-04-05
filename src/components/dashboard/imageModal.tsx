'use client'

import Image from "next/image";
import { PlusCircleIcon } from "@heroicons/react/24/outline"
import { useState, useEffect, useRef } from "react"
import { fetchImages, saveProductImages, deleteImage } from "@/app/_actions/productActions";
import { createClient } from "@/lib/supabase/client";
import { convertToWebP } from "@/lib/items/imageHandler";
import DashboardViewportPortal from "./DashboardViewportPortal";
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
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [processingFiles, setProcessingFiles] = useState(false)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

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

        setErrorMessage(null)
        setProcessingFiles(true)

        const files = Array.from(e.target.files);

        try {
            const newImages: EditableImage[] = []

            for (let index = 0; index < files.length; index += 1) {
                const file = files[index]
                const webpfile = await convertToWebP(file)

                newImages.push({
                    tempId: crypto.randomUUID(),
                    file: webpfile,
                    previewUrl: URL.createObjectURL(webpfile),
                    is_thumbnail: images.length === 0 && index === 0,
                    sort_order: images.length + index,
                    alt_text: product.props.meta_title ?? product.props.name,
                })
            }

            setImages(prev => {
                const updated = [...prev, ...newImages]
                if(!activeImage) setActiveImage(updated[0])
                return updated
            })
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Unable to prepare selected images for upload.')
        } finally {
            setProcessingFiles(false)
            e.target.value = ''
        }
    }

    async function uploadWithRetry(filePath: string, file: File) {
        const supabase = await createClient();
        let lastError: Error | null = null

        for (let attempt = 0; attempt < 2; attempt += 1) {
            const { error } = await supabase.storage.from('product-images').upload(filePath, file)

            if (!error) {
                return supabase.storage.from('product-images').getPublicUrl(filePath)
            }

            lastError = error
        }

        throw lastError ?? new Error('Image upload failed')
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
            setErrorMessage(null)

            const uploadedImages: EditableImage[] = []

            for (let index = 0; index < images.length; index += 1){
                const img = images[index];
                if (img.image_url && !img.file) {
                    uploadedImages.push(img);
                    continue;
                }

                if(!img.file) continue;

                const filePath = `products/${product.props.id}/${crypto.randomUUID()}.webp`;
                const { data } = await uploadWithRetry(filePath, img.file)

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

        }catch(error){
            setErrorMessage(error instanceof Error ? error.message : 'Unable to save product images right now.')
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
        <DashboardViewportPortal>
        <div className="fixed inset-0 z-[80] flex bg-black/30 p-3 backdrop-blur-xs sm:p-5">
            <div className="z-50 m-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_70px_-30px_rgba(15,23,42,0.45)] sm:max-h-[calc(100dvh-2.5rem)]">
                <div className="flex min-h-0 flex-col p-4 sm:p-5">
                    <div className="min-w-0 border-b border-rose-100 pb-3">
                        <h1 className="truncate text-lg font-semibold text-rose-900 sm:text-xl">{product.props.name}</h1>
                    </div>
                    <div className="min-h-0 overflow-y-auto py-4 sm:py-5">
                        <div className="flex flex-col items-center justify-center gap-3">
                        <div className="flex h-52 w-full max-w-md flex-col overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-stone-50 sm:h-60">
                            {/* This code below is to view the active image in the image viewer */}
                            {activeImage ? (
                                <>
                                    <div className="relative h-full w-full">
                                        <Image src={activeImage.image_url || activeImage.previewUrl || ''} alt={activeImage.alt_text || product.props.name} fill unoptimized className="object-cover" />
                                    </div>
                                </>
                            ) : ( <span className="flex h-full items-center justify-center px-4 text-center text-sm text-gray-400">Select an image</span>)}
                        </div>
                        {activeImage ? ( <div className="flex w-full max-w-md items-center justify-start gap-2 text-sm text-gray-500">
                            <label>Set as Thumbnail:</label>
                            <input type="checkbox" checked={!!activeImage.is_thumbnail} onChange={() => setThumbnail(activeImage)}/>
                        </div>) : null }
                        {activeImage ? (
                            <div className="mt-1 w-full max-w-md">
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
                        {errorMessage ? <p className="w-full max-w-md text-sm text-rose-700">{errorMessage}</p> : null}
                        <div className="flex h-auto min-h-14 w-full max-w-md flex-wrap items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-2">
                            {/* the code below is to show all uploaded images and select an image to view in the image viewer */}
                            {images.length > 0 ? 
                            (images?.map((i) => (<button type="button" onClick={() => setActiveImage(i)} key={getImageKey(i)} className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-gray-300 text-gray-400 cursor-pointer">{i.image_url || i.previewUrl ? <Image src={i.image_url || i.previewUrl || ''} alt={i.alt_text || product.props.name} fill unoptimized className="object-cover" /> : null}</button>))) 
                            : null}
                            <input ref={fileInputRef} type="file" accept="image/*" multiple hidden id="image-upload" onChange={handleFileUpload}/>
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-2 border-dashed border-gray-300 text-gray-400 cursor-pointer"><PlusCircleIcon className="size-6" /></button>
                        </div>
                        <p className="w-full max-w-md text-xs text-stone-500">You can select multiple images at once. Images are converted to WebP in the browser before upload to reduce transfer size.</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 border-t border-rose-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex justify-start">
                                <button className='rounded-md border border-rose-700 bg-rose-600 px-3 py-2 text-sm text-white hover:bg-rose-900 hover:text-rose-100' onClick={handleDelete}>Delete</button>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                            <button className='rounded-md border border-rose-700 px-3 py-2 text-sm text-rose-700 hover:bg-rose-700 hover:text-white' onClick={onClose} disabled={cancelState ? true : false}>Cancel</button>
                            <button onClick={handleSave} disabled={uploading || processingFiles} className='rounded-md border border-rose-700 bg-rose-700 px-3 py-2 text-sm text-white hover:bg-rose-900 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-70'>{processingFiles ? "Preparing..." : uploading ? "Saving..." : "Save"}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </DashboardViewportPortal>
    )
}
'use client'

import { PlusIcon } from "@heroicons/react/24/outline"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { addProduct } from "@/app/_actions/productActions";
import DashboardViewportPortal from "./DashboardViewportPortal";
import ProductFormFields from "./ProductFormFields";
import TagManager from "./TagManager";
import type { CategoryType } from "@/types/categoryType";
import type { ItemType, ProductFormValues, TagType } from "@/types/itemType";

type AddProductModalProps = {
    catList: {
        catList: CategoryType[]
    }
    allTags: TagType[]
    buttonLabel?: string
    containerClassName?: string
    buttonClassName?: string
}

const initialValues: ProductFormValues = {
    name: '',
    price: 0,
    category_id: null,
    description: '',
    meta_title: '',
    meta_description: '',
}

export default function AddProductModal({
    catList,
    allTags,
    buttonLabel,
    containerClassName,
    buttonClassName,
}: AddProductModalProps){
    const router = useRouter()
    const [showAddModal, setShowAddModal] = useState(false);
    const [createdProduct, setCreatedProduct] = useState<ItemType | null>(null)
    const [saveError, setSaveError] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [values, setValues] = useState<ProductFormValues>({
        ...initialValues,
        category_id: catList.catList[0]?.id ?? null,
    });

    function resetModalState() {
        setCreatedProduct(null)
        setSaveError(null)
        setIsSaving(false)
        setValues({
            ...initialValues,
            category_id: catList.catList[0]?.id ?? null,
        })
    }

    function handleClose() {
        resetModalState()
        setShowAddModal(false)
    }

    function updateValue<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
        setValues((current) => ({ ...current, [key]: value }));
    }

    async function handleSave(){
        setIsSaving(true)
        setSaveError(null)

        try {
            if (createdProduct) {
                handleClose()
                router.refresh()
                return
            }

            const product = await addProduct(values)
            setCreatedProduct({
                ...product,
                item_images: product.item_images ?? [],
                items_tags: product.items_tags ?? [],
                categories: product.categories ?? null,
            })
            router.refresh()
        } catch (error) {
            setSaveError(error instanceof Error ? error.message : 'Failed to save product')
        } finally {
            setIsSaving(false)
        }
    }

    const handleTagsUpdated = () => {
        return
    }


    return (
        <>
            <div className={containerClassName ?? "flex w-full justify-end"}>
                <button
                    onClick={() => setShowAddModal(true)}
                    className={buttonClassName ?? "mt-2 rounded-md border border-rose-700 bg-rose-700 p-1 text-white hover:bg-white hover:text-rose-700"}
                    aria-label={buttonLabel ?? "Add product"}
                >
                    <span className="flex items-center gap-2">
                        <PlusIcon className="size-6"/>
                        {buttonLabel ? <span>{buttonLabel}</span> : null}
                    </span>
                </button>
            </div>

            {showAddModal && 
            <DashboardViewportPortal>
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4" onClick={handleClose}>
                <div className="flex max-h-[min(90vh,52rem)] w-full max-w-md flex-col overflow-y-auto rounded-xl bg-white p-5 shadow-lg" onClick={(event) => event.stopPropagation()}>
                    <div className='flex flex-col'>
                            <h1 className='text-lg font-semibold border-b-1 pb-2 mb-4'>{createdProduct ? 'Finish Product Setup' : 'Add Product'}</h1>
                            {createdProduct ? <p className='mb-6 text-sm text-stone-600'>The product has been created. You can still add tags before closing this modal.</p> : <div className='mb-6' />}
                        </div>
                        <div>
                            <ProductFormFields values={values} categories={catList.catList} updateValue={updateValue}>
                                {createdProduct ? (
                                    <div className='mb-10 border-t pt-4'>
                                        <TagManager
                                            item={createdProduct}
                                            allTags={allTags}
                                            onUpdate={handleTagsUpdated}
                                        />
                                    </div>
                                ) : null}
                            </ProductFormFields>
                            {saveError ? <p className='mb-4 text-sm text-red-600'>{saveError}</p> : null}
                        </div>
                        <div className='flex justify-between'>
                            <button onClick={handleClose} className="bg-white border-rose-700 border-1 text-rose-700 rounded-md px-3 py-1 cursor-pointer hover:bg-rose-700 hover:text-white">Close</button>
                            <button onClick={handleSave} disabled={isSaving} className="bg-white border-rose-700 border-1 text-rose-700 rounded-md px-3 py-1 cursor-pointer hover:bg-rose-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? 'Saving...' : createdProduct ? 'Done' : 'Create product'}</button>
                        </div>
                </div>
            </div>
            </DashboardViewportPortal>}
        </>
    )
}
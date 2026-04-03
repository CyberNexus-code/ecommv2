'use client'

import { PlusIcon } from "@heroicons/react/24/outline"
import { useState } from "react"
import { addProduct } from "@/app/_actions/productActions";
import DashboardViewportPortal from "./DashboardViewportPortal";
import type { CategoryType } from "@/types/categoryType";
import type { ProductFormValues } from "@/types/itemType";

type AddProductModalProps = {
    catList: {
        catList: CategoryType[]
    }
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
    buttonLabel,
    containerClassName,
    buttonClassName,
}: AddProductModalProps){
    const [showAddModal, setShowAddModal] = useState(false);
    const [values, setValues] = useState<ProductFormValues>({
        ...initialValues,
        category_id: catList.catList[0]?.id ?? null,
    });

    function updateValue<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
        setValues((current) => ({ ...current, [key]: value }));
    }

    async function handleSave(){
        await addProduct(values);
        setValues({
            ...initialValues,
            category_id: catList.catList[0]?.id ?? null,
        });
        setShowAddModal(false);
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
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4" onClick={() => setShowAddModal(false)}>
                <div className="flex max-h-[min(90vh,52rem)] w-full max-w-md flex-col overflow-y-auto rounded-xl bg-white p-5 shadow-lg" onClick={(event) => event.stopPropagation()}>
                    <div className='flex flex-col'>
                            <h1 className='text-lg font-semibold border-b-1 pb-2 mb-10'>Add Product</h1>
                        </div>
                        <div>
                            <div className='mb-4'>
                                <label className='block mb-2'>Name:</label>
                                <input type="text" value={values.name} placeholder="Product name" onChange={(e) => updateValue('name', e.target.value)} className='w-full border-1 p-2 rounded-md'/>
                            </div>
                            <div className='mb-4'>
                                <label className='block mb-2'>Price:</label>
                                <input type="number" value={values.price} placeholder="Price" onChange={(e) => updateValue('price', Number.parseFloat(e.target.value) || 0)} className='w-full border-1 p-2 rounded-md'/>
                            </div>
                            <div className='mb-4'>
                                <label className='block mb-2'>Category:</label>
                                <select value={values.category_id ?? ''} onChange={(e) => updateValue('category_id', e.target.value || null)}
                                className='w-full border-1 p-2 rounded-md'>
                                    <option value="">Select category</option>
                                    {catList.catList.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className='block mb-2'>Description:</label>
                                <textarea value={values.description} placeholder="Product description" onChange={(e) => updateValue('description', e.target.value)} className='w-full border-1 p-2 rounded-md'/>
                            </div>
                            <div className='mb-4'>
                                <label className='block mb-2'>Meta Title:</label>
                                <input type="text" value={values.meta_title} placeholder="SEO title shown in search results" onChange={(e) => updateValue('meta_title', e.target.value)} className='w-full border-1 p-2 rounded-md'/>
                            </div>
                            <div className="mb-10">
                                <label className='block mb-2'>Meta Description:</label>
                                <textarea value={values.meta_description} placeholder="SEO description shown in search results" onChange={(e) => updateValue('meta_description', e.target.value)} className='w-full border-1 p-2 rounded-md'/>
                            </div>
                        </div>
                        <div className='flex justify-between'>
                            <button onClick={() => setShowAddModal(false)} className="bg-white border-rose-700 border-1 text-rose-700 rounded-md px-3 py-1 cursor-pointer hover:bg-rose-700 hover:text-white">Close</button>
                            <button onClick={handleSave} className="bg-white border-rose-700 border-1 text-rose-700 rounded-md px-3 py-1 cursor-pointer hover:bg-rose-700 hover:text-white">Save</button>
                        </div>
                </div>
            </div>
            </DashboardViewportPortal>}
        </>
    )
}
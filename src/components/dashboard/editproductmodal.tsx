'use client'

import {useState} from 'react'
import { updateProduct } from '@/app/_actions/productActions';
import TagManager from './TagManager';
import type { CategoryType } from '@/types/categoryType';
import type { ItemType, ProductFormValues, TagType } from '@/types/itemType';

type EditableProduct = ItemType & {
    allTags: TagType[]
    catList: CategoryType[]
}

export default function EditProductModal({product, onClose}: {product: EditableProduct, onClose: ()=>void}) {
    const [values, setValues] = useState<ProductFormValues>({
        name: product.name,
        price: product.price,
        category_id: product.category_id,
        description: product.description ?? '',
        meta_title: product.meta_title ?? '',
        meta_description: product.meta_description ?? '',
    });

    function updateValue<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
        setValues((current) => ({ ...current, [key]: value }));
    }

    async function handleSave() {
       try {
        await updateProduct(product.id, values);
        onClose();
       }catch{
        return;
       }
    }

    const handleTagsUpdated = () => {
        return;
    };

    return (
        <>
            <div className='flex flex-col fixed rounded-lg m-auto inset-0 p-4 z-40' onClick={onClose}>
                <div className='fixed inset-0 z-50 flex flex-col items-center justify-center'>
                    <div className='bg-white rounded-xl shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto'  onClick={(e) => e.stopPropagation()}>
                        <div className='flex flex-col'>
                            <h1 className='text-lg font-semibold border-b-1 pb-2 mb-10'>Edit Product</h1>
                        </div>
                        <div>
                            <div className='mb-4'>
                                <label className='block mb-2'>Name:</label>
                                <input type="text" value={values.name} onChange={(e) => updateValue('name', e.target.value)} className='w-full border-1 p-2 rounded-md'/>
                            </div>
                            <div className='mb-4'>
                                <label className='block mb-2'>Price:</label>
                                <input type="number" value={values.price} onChange={(e) => updateValue('price', Number.parseFloat(e.target.value) || 0)} className='w-full border-1 p-2 rounded-md'/>
                            </div>
                            <div className='mb-4'>
                                <label className='block mb-2'>Category:</label>
                                <select value={values.category_id ?? ''} onChange={(e) => updateValue('category_id', e.target.value === '' ? null : e.target.value)}
                                className='w-full border-1 p-2 rounded-md'>
                                    <option value="">Select category</option>
                                    {product.catList.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                              <div className="mb-4">
                                <label className='block mb-2'>Description:</label>
                                <textarea value={values.description} onChange={(e) => updateValue('description', e.target.value)} className='w-full border-1 p-2 rounded-md'/>
                            </div>
                            <div className='mb-4'>
                                <label className='block mb-2'>Meta Title:</label>
                                <input type="text" value={values.meta_title} onChange={(e) => updateValue('meta_title', e.target.value)} className='w-full border-1 p-2 rounded-md'/>
                            </div>
                            <div className="mb-10">
                                <label className='block mb-2'>Meta Description:</label>
                                <textarea value={values.meta_description} onChange={(e) => updateValue('meta_description', e.target.value)} className='w-full border-1 p-2 rounded-md'/>
                            </div>
                            <div className='mb-10 pb-4 border-t pt-4'>
                                <TagManager
                                    item={product}
                                    allTags={product.allTags}
                                    onUpdate={handleTagsUpdated}
                                />
                            </div>
                        </div>
                        <div className='flex justify-between'>
                            <button onClick={onClose} className="bg-white border-rose-700 border-1 text-rose-700 rounded-md px-3 py-1 cursor-pointer hover:bg-rose-700 hover:text-white">Close</button>
                            <button onClick={handleSave} className="bg-white border-rose-700 border-1 text-rose-700 rounded-md px-3 py-1 cursor-pointer hover:bg-rose-700 hover:text-white">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}



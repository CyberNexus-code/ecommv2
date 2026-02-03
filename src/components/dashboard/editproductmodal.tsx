'use client'

import {useState, useEffect, use} from 'react'
import { createClient } from '@/lib/supabase/client';
import { updateProduct } from '@/app/_actions/productActions';

export default function EditProductModal({product, onClose}: {product: any, onClose: ()=>void}) {
    const [name, setName] = useState(product.name);
    const [price, setPrice] = useState(product.price);
    const [categoryId, setCategoryId] = useState<string | null>(product.category_id ?? null);
    const [description, setDescription] = useState(product.description);
    
    const supabase = createClient();

    async function handleSave() {
       try {
        await updateProduct(product.id, name, price, categoryId, description);
        onClose();
       }catch(error){
        console.error(error);
       }
    }

    return (
        <>
            <div className='flex flex-col fixed rounded-lg border-1 m-auto bg-black/30 backdrop-blur-sm inset-0 p-4 z-40' onClick={onClose}>
                <div className='fixed inset-0 z-50 flex flex-col items-center justify-center border'>
                    <div className='bg-white rounded-lg border-1 border-rose-900 p-6 w-full max-w-md shadow-lg'  onClick={(e) => e.stopPropagation()}>
                        <div className='flex flex-col'>
                            <h1 className='text-lg font-semibold border-b-1 pb-2 mb-10'>Edit Product</h1>
                        </div>
                        <div>
                            <div className='mb-4'>
                                <label className='block mb-2'>Name:</label>
                                <input type="text" defaultValue={product.name} onChange={(e) => setName(e.target.value)} className='w-full border-1 p-2 rounded-md'/>
                            </div>
                            <div className='mb-4'>
                                <label className='block mb-2'>Price:</label>
                                <input type="number" defaultValue={product.price} onChange={(e) => setPrice(parseFloat(e.target.value))} className='w-full border-1 p-2 rounded-md'/>
                            </div>
                            <div className='mb-4'>
                                <label className='block mb-2'>Category:</label>
                                <select value={categoryId ?? ''} onChange={(e) => setCategoryId(e.target.value === '' ? null : e.target.value)}
                                className='w-full border-1 p-2 rounded-md'>
                                    <option value="">Select category</option>
                                    {product.catList.map((cat: any) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                              <div className="mb-10">
                                <label className='block mb-2'>Description:</label>
                                <textarea defaultValue={product.description} onChange={(e) => setDescription(e.target.value)} className='w-full border-1 p-2 rounded-md'/>
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



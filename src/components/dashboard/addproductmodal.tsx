'use client'

import { PlusIcon } from "@heroicons/react/24/outline"
import { useState } from "react"

export default function AddProductModal({catList}: {catList: any}){
    const [showAddModal, setShowAddModal] = useState(false);
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0.00);

    console.log("showAddModal:", showAddModal)

    async function handleSave(){
        
    }


    return (
        <>
            <div className="flex w-full justify-end">
                <button onClick={() => setShowAddModal(true)} className="border border-rose-700 p-1 mt-2 rounded-md bg-rose-700 text-white hover:bg-white hover:text-rose-700"><PlusIcon className="size-6"/></button>
            </div>

            {showAddModal && 
            <div className="fixed inset-0 flex justify-center items-center">
                <div className="flex flex-col border border-roze-900 bg-white rounded-md p-10">
                    <div className='flex flex-col'>
                            <h1 className='text-lg font-semibold border-b-1 pb-2 mb-10'>Edit Product</h1>
                        </div>
                        <div>
                            <div className='mb-4'>
                                <label className='block mb-2'>Name:</label>
                                <input type="text" aria-placeholder="Product name" onChange={(e) => setName(e.target.value)} className='w-full border-1 p-2 rounded-md'/>
                            </div>
                            <div className='mb-4'>
                                <label className='block mb-2'>Price:</label>
                                <input type="number" aria-placeholder="Price" onChange={(e) => setPrice(parseFloat(e.target.value))} className='w-full border-1 p-2 rounded-md'/>
                            </div>
                            <div className='mb-10'>
                                <label className='block mb-2'>Category:</label>
                                <select aria-placeholder="Select category" onChange={(e) => setCategoryId(e.target.value)}
                                className='w-full border-1 p-2 rounded-md'>
                                    {catList.map((cat: any) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className='flex justify-between'>
                            <button onClick={() => setShowAddModal(false)} className="bg-white border-rose-700 border-1 text-rose-700 rounded-md px-3 py-1 cursor-pointer hover:bg-rose-700 hover:text-white">Close</button>
                            <button onClick={} className="bg-white border-rose-700 border-1 text-rose-700 rounded-md px-3 py-1 cursor-pointer hover:bg-rose-700 hover:text-white">Save</button>
                        </div>
                </div>
            </div>}
        </>
    )
}
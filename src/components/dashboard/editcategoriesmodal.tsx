'use client'

import { updateCategory } from "@/app/_actions/categoryActions";
import { useState} from 'react'

export default function EditCategoriesModal({category, onClose}: {category: any, onClose: ()=>void}) {

    const [categoryId, setCategoryId] = useState(category.id);
    const [name, setName] = useState(category.name);

    async function handleSave() {
       try {
        await updateCategory(categoryId, name);
        onClose();
       }
         catch(error){}
    }

    return (
        <>
            <div className='flex flex-col fixed rounded-lg border-1 m-auto bg-black/30 backdrop-blur-sm inset-0 p-4 z-40' onClick={onClose}>
                <div className='fixed inset-0 z-50 flex flex-col items-center justify-center border'>
                    <div className='bg-white rounded-lg border-1 border-rose-900 p-6 w-full max-w-md shadow-lg'  onClick={(e) => e.stopPropagation()}>
                        <div className='flex flex-col'>
                            <h1 className='text-lg font-semibold border-b-1 pb-2 mb-10'>Edit Category</h1>
                        </div>
                        <div>
                            <div className='mb-4'>
                                <label className='block mb-2'>Name:</label>
                                <input type="text" defaultValue={category.name} onChange={(e) => setName(e.target.value)} className='w-full border-1 p-2 rounded-md'/>
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
'use client'

import { updateCategory } from "@/app/_actions/categoryActions";
import { useState} from 'react'
import DashboardViewportPortal from './DashboardViewportPortal';
import type { CategoryType } from '@/types/categoryType';

export default function EditCategoriesModal({category, onClose}: {category: CategoryType, onClose: ()=>void}) {

    const [name, setName] = useState(category.name);

    async function handleSave() {
       try {
    await updateCategory(category.id, name);
        onClose();
       }
                 catch{}
    }

    return (
        <DashboardViewportPortal>
            <div className='fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4' onClick={onClose}>
                    <div className='w-full max-w-md rounded-xl bg-white p-6 shadow-lg' onClick={(e) => e.stopPropagation()}>
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
        </DashboardViewportPortal>
    )  
}
"use client"

import { PlusIcon } from "@heroicons/react/24/outline"
import { useState} from 'react'
import { addCategory } from "@/app/_actions/categoryActions";

export default function AddcategoryModal(){

    const [showModal, setShowModal] = useState(false);
    const [catName, setCatName] = useState('');

    return (
    <>
        <div className="flex justify-end">
            <button onClick={() => setShowModal(true)} className="border border-rose-700 p-1 mt-2 rounded-md bg-rose-700 text-white hover:bg-white hover:text-rose-700"><PlusIcon className="size-6"/></button>
        </div>

        {showModal &&
            <div className="fixed inset-0 flex justify-center items-center">
                <div className="flex flex-col border border-roze-900 bg-white rounded-md p-5 w-full max-w-md gap-5">
                    <div className='flex flex-col'>
                        <h1>Add category</h1>
                    </div>
                    <div className="flex flex-col">
                        <label>Name</label>
                        <input onChange={(e) => setCatName(e.target.value)} className="w-full border border-grey-400 rounded-sm px-1" type="text" placeholder="e.g: basket items"></input>
                    </div>
                    <div className='flex justify-end gap-2'>
                        <button onClick={() => setShowModal(false)} className="bg-white border-rose-700 border-1 text-rose-700 rounded-md px-3 py-1 cursor-pointer hover:bg-rose-700 hover:text-white">Close</button>
                        <button onClick={() => {addCategory(catName), setShowModal(false)}} className="bg-white border-rose-700 border-1 text-rose-700 rounded-md px-3 py-1 cursor-pointer hover:bg-rose-700 hover:text-white">Save</button>
                    </div>
                </div>
            </div>
        }
    </>)
}
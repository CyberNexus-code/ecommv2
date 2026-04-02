"use client"

import { PlusIcon } from "@heroicons/react/24/outline"
import { useState} from 'react'
import { addCategory } from "@/app/_actions/categoryActions";
import DashboardViewportPortal from "./DashboardViewportPortal";

export default function AddcategoryModal(){

    const [showModal, setShowModal] = useState(false);
    const [catName, setCatName] = useState('');

    async function handleSave() {
        await addCategory(catName);
        setShowModal(false);
    }

    return (
    <>
        <div className="flex justify-end">
            <button onClick={() => setShowModal(true)} className="border border-rose-700 p-1 mt-2 rounded-md bg-rose-700 text-white hover:bg-white hover:text-rose-700"><PlusIcon className="size-6"/></button>
        </div>

        {showModal &&
            <DashboardViewportPortal>
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4" onClick={() => setShowModal(false)}>
                <div className="flex w-full max-w-md flex-col gap-5 rounded-xl bg-white p-5 shadow-lg" onClick={(event) => event.stopPropagation()}>
                    <div className='flex flex-col'>
                        <h1 className='text-lg font-semibold border-b-1 pb-2'>Add category</h1>
                    </div>
                    <div className="flex flex-col">
                        <label>Name</label>
                        <input onChange={(e) => setCatName(e.target.value)} className="w-full border border-grey-400 rounded-sm px-1" type="text" placeholder="e.g: basket items"></input>
                    </div>
                    <div className='flex justify-end gap-2'>
                        <button onClick={() => setShowModal(false)} className="bg-white border-rose-700 border-1 text-rose-700 rounded-md px-3 py-1 cursor-pointer hover:bg-rose-700 hover:text-white">Close</button>
                        <button onClick={handleSave} className="bg-white border-rose-700 border-1 text-rose-700 rounded-md px-3 py-1 cursor-pointer hover:bg-rose-700 hover:text-white">Save</button>
                    </div>
                </div>
            </div>
            </DashboardViewportPortal>
        }
    </>)
}
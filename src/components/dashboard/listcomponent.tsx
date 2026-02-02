'use client'

import { useState } from "react"
import { TrashIcon } from "@heroicons/react/24/outline"
import EditProductModal from "./editproductmodal"
import AlertModal from "./alertModal";

export default function ListComponent({props}: {props: any}){
    const [showModal, setShowModal] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);

    if(props.type === "products"){
        return (
            <>
             <div key={props.id} className="flex flex-column justify-between border-b-1 border-gray-400 w-full">
                            <div>
                                <h2 className="">{props.name}</h2>
                                <div>Price: R{props.price}</div>
                                <div>Category: {props.categories.name}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setShowModal(true)} className="bg-white border-rose-700 border-1 text-rose-700 rounded-md px-3 py-1 cursor-pointer hover:bg-rose-700 hover:text-white">Edit</button>
                                <button onClick={() => setShowAlertModal(true)} className="border border-rose-700 p-1 rounded-sm text-rose-700 hover:text-white hover:bg-rose-700"><TrashIcon className="size-6"/></button>
                            </div>    
                        </div>

                {showModal && <EditProductModal product={props} onClose={() => setShowModal(false)} />}
                {showAlertModal && <AlertModal product={props} onClose={() => setShowAlertModal(false)}/>}
            </>
        )
    }

    if(props.type = "categories"){
        return (
            <div>Categories list will be here</div>
        )
    }
}
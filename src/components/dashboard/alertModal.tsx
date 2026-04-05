'use client'

import { removeProduct } from '@/app/_actions/productActions';
import { removeCategory } from '@/app/_actions/categoryActions';
import DashboardViewportPortal from './DashboardViewportPortal';

type AlertModalProps = {
    props: {
        id: string
        name: string
        type: 'products' | 'categories'
    }
    onClose: ()=>void
}

export default function AlertModal({props, onClose}: AlertModalProps){
    
    if(props.type === "products"){

        async function handleRemove(){
            try{
                await removeProduct(props.id);
            }catch{
                return;
            }
            onClose();
        }
        
        return (
        <DashboardViewportPortal>
            <div className='fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4' onClick={onClose}>
                    <div className='w-full max-w-lg rounded-xl bg-white p-5 shadow-lg md:w-120' onClick={(event) => event.stopPropagation()}>
                        <h1 className='text-lg font-semibold border-b-1 pb-2'>Delete Product</h1>
                        <p className='py-10'>Are you sure you want to delete: {props.name}</p>
                        <div className='flex justify-end gap-5'>
                            <button className='border border-rose-700 text-rose-700 rounded-md px-2 py-1 hover:bg-rose-700 hover:text-white' onClick={onClose}>Cancel</button>
                            <button className='bg-rose-700 text-white rounded-md px-2 py-1 hover:bg-rose-900' onClick={handleRemove}>Delete</button>
                        </div>
                    </div>
            </div>
        </DashboardViewportPortal>)
    }

    if(props.type === "categories"){
        async function handleRemove(){
            try{
             await removeCategory(props.id);
            onClose();
            }catch{
                return;
            }
            onClose();
        }
          
        return (
        <DashboardViewportPortal>
            <div className='fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4' onClick={onClose}>
                    <div className='w-full max-w-lg rounded-xl bg-white p-5 shadow-lg md:w-120' onClick={(event) => event.stopPropagation()}>
                        <h1 className='text-lg font-semibold border-b-1 pb-2'>Remove Category</h1>
                        <p className='py-10'>Are you sure you want to remove: {props.name}</p>
                        <div className='flex justify-end gap-5'>
                            <button className='border border-rose-700 text-rose-700 rounded-md px-2 py-1 hover:bg-rose-700 hover:text-white' onClick={onClose}>Cancel</button>
                            <button className='bg-rose-700 text-white rounded-md px-2 py-1 hover:bg-rose-900' onClick={handleRemove}>Delete</button>
                        </div>
                    </div>
            </div>
        </DashboardViewportPortal>)
    }
}
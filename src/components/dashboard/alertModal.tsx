'use client'

import { setProductActive } from '@/app/_actions/productActions';
import { removeCategory } from '@/app/_actions/categoryActions';
import DashboardViewportPortal from './DashboardViewportPortal';

type AlertModalProps = {
    props: {
        id: string
        name: string
        type: 'products' | 'categories'
        is_active?: boolean
    }
    onClose: ()=>void
}

export default function AlertModal({props, onClose}: AlertModalProps){
    
    if(props.type === "products"){

        async function handleRemove(){
            try{
                await setProductActive(props.id, !(props.is_active ?? true));
            }catch{
                return;
            }
            onClose();
        }

        const isActive = props.is_active ?? true
        const actionLabel = isActive ? 'Hide from storefront' : 'Show on storefront'
        const description = isActive
            ? `This will remove ${props.name} from the storefront without deleting it.`
            : `This will make ${props.name} visible on the storefront again.`
        
        return (
        <DashboardViewportPortal>
            <div className='fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4' onClick={onClose}>
                    <div className='w-full max-w-lg rounded-xl bg-white p-5 shadow-lg md:w-120' onClick={(event) => event.stopPropagation()}>
                        <h1 className='text-lg font-semibold border-b-1 pb-2'>{actionLabel}</h1>
                        <p className='py-10'>{description}</p>
                        <div className='flex justify-end gap-5'>
                            <button className='border border-rose-700 text-rose-700 rounded-md px-2 py-1 hover:bg-rose-700 hover:text-white' onClick={onClose}>Cancel</button>
                            <button className='bg-rose-700 text-white rounded-md px-2 py-1 hover:bg-rose-900' onClick={handleRemove}>{isActive ? 'Hide' : 'Show'}</button>
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
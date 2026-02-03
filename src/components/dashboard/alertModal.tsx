'use client'

import {useState} from 'react';
import { removeProduct } from '@/app/_actions/productActions';
import { removeCategory } from '@/app/_actions/categoryActions';

export default function AlertModal({props, onClose}: {props: any, onClose: ()=>void}){
    
    if(props.type === "products"){
        async function handleRemove(){
            try{
                await removeProduct(props.id);
            }catch(err){
                console.error(err);
            }
            onClose();
        }
        
        return (
        <>
            <div className='flex flex-col fixed rounded-lg border-1 m-auto inset-0 p-4 z-40'>
                <div className='fixed inset-0 z-50 flex flex-col items-center justify-center border'>
                    <div className='bg-white px-10 border border-roze-900'>
                        <h1 className='py-10'>Are you sure you want to remove: {props.name}</h1>
                        <div className='flex justify-end pb-5 gap-5'>
                            <button className='border border-rose-700 text-rose-700 rounded-md px-2 py-1 hover:bg-rose-700 hover:text-white' onClick={onClose}>Cancel</button>
                            <button className='bg-rose-700 text-white rounded-md px-2 py-1 hover:bg-rose-900' onClick={handleRemove}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </>)
    }

    if(props.type === "categories"){
        async function handleRemove(){
            try{
             await removeCategory(props.id);
            onClose();
            }catch(err){
                console.error(err);
            }
            onClose();
        }
          
        return (
        <>
            <div className='flex flex-col fixed rounded-lg border-1 m-auto inset-0 p-4 z-40'>
                <div className='fixed inset-0 z-50 flex flex-col items-center justify-center border'>
                    <div className='bg-white px-10 border border-roze-900'>
                        <h1 className='py-10'>Are you sure you want to remove: {props.name}</h1>
                        <div className='flex justify-end pb-5 gap-5'>
                            <button className='border border-rose-700 text-rose-700 rounded-md px-2 py-1 hover:bg-rose-700 hover:text-white' onClick={onClose}>Cancel</button>
                            <button className='bg-rose-700 text-white rounded-md px-2 py-1 hover:bg-rose-900' onClick={handleRemove}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </>)
    }
}
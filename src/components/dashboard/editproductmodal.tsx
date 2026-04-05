'use client'

import {useState} from 'react'
import { updateProduct } from '@/app/_actions/productActions';
import TagManager from './TagManager';
import DashboardViewportPortal from './DashboardViewportPortal';
import ProductFormFields from './ProductFormFields';
import type { CategoryType } from '@/types/categoryType';
import type { ItemType, ProductFormValues, TagType } from '@/types/itemType';

type EditableProduct = ItemType & {
    allTags: TagType[]
    catList: CategoryType[]
}

export default function EditProductModal({product, onClose}: {product: EditableProduct, onClose: ()=>void}) {
    const [values, setValues] = useState<ProductFormValues>({
        name: product.name,
        price: product.price,
        category_id: product.category_id,
        description: product.description ?? '',
        meta_title: product.meta_title ?? '',
        meta_description: product.meta_description ?? '',
    });

    function updateValue<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
        setValues((current) => ({ ...current, [key]: value }));
    }

    async function handleSave() {
       try {
        await updateProduct(product.id, values);
        onClose();
       }catch{
        return;
       }
    }

    const handleTagsUpdated = () => {
        return;
    };

    return (
        <DashboardViewportPortal>
            <div className='fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4' onClick={onClose}>
                    <div className='w-full max-w-md max-h-[min(90vh,52rem)] overflow-y-auto rounded-xl bg-white p-6 shadow-lg' onClick={(e) => e.stopPropagation()}>
                        <div className='flex flex-col'>
                            <h1 className='text-lg font-semibold border-b-1 pb-2 mb-10'>Edit Product</h1>
                        </div>
                        <div>
                            <ProductFormFields values={values} categories={product.catList} updateValue={updateValue}>
                                <div className='mb-10 pb-4 border-t pt-4'>
                                    <TagManager
                                        item={product}
                                        allTags={product.allTags}
                                        onUpdate={handleTagsUpdated}
                                    />
                                </div>
                            </ProductFormFields>
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



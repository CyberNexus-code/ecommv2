'use client'

import {useState} from 'react'
import { useRouter } from 'next/navigation'
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
    const router = useRouter()
    const [isActive, setIsActive] = useState(product.is_active)
    const [saveError, setSaveError] = useState<string | null>(null)
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
        setSaveError(null)

        try {
            await updateProduct(product.id, values, { isActive });
            router.refresh()
            onClose();
        } catch (error) {
            setSaveError(error instanceof Error ? error.message : 'Failed to save product changes')
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
                                <div className='mb-4 rounded-xl border border-rose-100 bg-rose-50/50 p-3'>
                                    <div className='flex items-center justify-between gap-3'>
                                        <div>
                                            <p className='text-sm font-semibold text-rose-900'>Storefront visibility</p>
                                            <p className='text-xs text-stone-500'>Toggle whether this product appears on the storefront.</p>
                                        </div>
                                        <label className='inline-flex items-center gap-2 text-sm text-rose-900'>
                                            <input
                                                type='checkbox'
                                                checked={isActive}
                                                onChange={(event) => setIsActive(event.target.checked)}
                                                className='h-4 w-4 rounded border-rose-300 text-rose-700 focus:ring-rose-400'
                                            />
                                            {isActive ? 'Live' : 'Hidden'}
                                        </label>
                                    </div>
                                </div>
                                <div className='mb-10 pb-4 border-t pt-4'>
                                    <TagManager
                                        item={product}
                                        allTags={product.allTags}
                                        onUpdate={handleTagsUpdated}
                                    />
                                </div>
                            </ProductFormFields>
                            {saveError ? <p className='-mt-6 mb-6 text-sm text-red-600'>{saveError}</p> : null}
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



'use client'

import {useState} from 'react'
import { updateProduct } from '@/app/_actions/productActions';
import { addCategory } from '@/app/_actions/categoryActions';
import TagManager from './TagManager';
import DashboardViewportPortal from './DashboardViewportPortal';
import type { CategoryType } from '@/types/categoryType';
import type { ItemType, ProductFormValues, TagType } from '@/types/itemType';

type EditableProduct = ItemType & {
    allTags: TagType[]
    catList: CategoryType[]
}

export default function EditProductModal({product, onClose}: {product: EditableProduct, onClose: ()=>void}) {
    const createCategoryValue = '__create_new_category__'
    const [categories, setCategories] = useState(product.catList)
    const [isAddingCategory, setIsAddingCategory] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [categoryError, setCategoryError] = useState<string | null>(null)
    const [isCreatingCategory, setIsCreatingCategory] = useState(false)
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

    async function handleCreateCategory() {
        const normalizedName = newCategoryName.trim()

        if (!normalizedName) {
            return
        }

        setIsCreatingCategory(true)
        setCategoryError(null)

        try {
            const createdCategory = await addCategory(normalizedName)
            setCategories((current) => {
                if (current.some((category) => category.id === createdCategory.id)) {
                    return current
                }

                return [...current, createdCategory].sort((left, right) => left.name.localeCompare(right.name))
            })
            updateValue('category_id', createdCategory.id)
            setIsAddingCategory(false)
            setNewCategoryName('')
        } catch (error) {
            setCategoryError(error instanceof Error ? error.message : 'Failed to create category')
        } finally {
            setIsCreatingCategory(false)
        }
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
                            <div className='mb-4'>
                                <label className='block mb-2'>Name:</label>
                                <input type="text" value={values.name} onChange={(e) => updateValue('name', e.target.value)} className='w-full border-1 p-2 rounded-md'/>
                            </div>
                            <div className='mb-4'>
                                <label className='block mb-2'>Price:</label>
                                <input type="number" value={values.price} onChange={(e) => updateValue('price', Number.parseFloat(e.target.value) || 0)} className='w-full border-1 p-2 rounded-md'/>
                            </div>
                            <div className='mb-4'>
                                <label className='block mb-2'>Category:</label>
                                <select value={isAddingCategory ? createCategoryValue : values.category_id ?? ''} onChange={(e) => {
                                    if (e.target.value === createCategoryValue) {
                                        setIsAddingCategory(true)
                                        setCategoryError(null)
                                        return
                                    }

                                    setIsAddingCategory(false)
                                    setCategoryError(null)
                                    updateValue('category_id', e.target.value === '' ? null : e.target.value)
                                }}
                                className='w-full border-1 p-2 rounded-md'>
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                    <option value={createCategoryValue}>+ Add new category</option>
                                </select>
                                {isAddingCategory ? (
                                <div className='mt-3 border-t border-rose-100 pt-3'>
                                    <p className='mb-2 text-xs font-medium text-gray-600'>Create and select a new category</p>
                                    <div className='flex flex-col gap-2 sm:flex-row'>
                                        <input
                                            type="text"
                                            value={newCategoryName}
                                            onChange={(event) => setNewCategoryName(event.target.value)}
                                            placeholder="New category name"
                                            className='w-full rounded-md border-1 p-2'
                                        />
                                        <button
                                            type="button"
                                            onClick={handleCreateCategory}
                                            disabled={!newCategoryName.trim() || isCreatingCategory}
                                            className='rounded-md border border-rose-700 bg-rose-700 px-3 py-2 text-sm text-white hover:bg-rose-900 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-60'
                                        >
                                            {isCreatingCategory ? 'Creating...' : 'Create'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsAddingCategory(false)
                                                setNewCategoryName('')
                                                setCategoryError(null)
                                            }}
                                            className='rounded-md border border-rose-200 px-3 py-2 text-sm text-rose-700 hover:bg-rose-50'
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                    {categoryError ? <p className='mt-2 text-xs text-red-600'>{categoryError}</p> : null}
                                </div>
                                ) : null}
                            </div>
                              <div className="mb-4">
                                <label className='block mb-2'>Description:</label>
                                <textarea value={values.description} onChange={(e) => updateValue('description', e.target.value)} className='w-full border-1 p-2 rounded-md'/>
                            </div>
                            <div className='mb-4'>
                                <label className='block mb-2'>Meta Title:</label>
                                <input type="text" value={values.meta_title} onChange={(e) => updateValue('meta_title', e.target.value)} className='w-full border-1 p-2 rounded-md'/>
                            </div>
                            <div className="mb-10">
                                <label className='block mb-2'>Meta Description:</label>
                                <textarea value={values.meta_description} onChange={(e) => updateValue('meta_description', e.target.value)} className='w-full border-1 p-2 rounded-md'/>
                            </div>
                            <div className='mb-10 pb-4 border-t pt-4'>
                                <TagManager
                                    item={product}
                                    allTags={product.allTags}
                                    onUpdate={handleTagsUpdated}
                                />
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



'use client'

import { useState } from 'react'
import { addCategory } from '@/app/_actions/categoryActions'
import type { ReactNode } from 'react'
import type { CategoryType } from '@/types/categoryType'
import type { ProductFormValues } from '@/types/itemType'

type ProductFormFieldsProps = {
    values: ProductFormValues
    categories: CategoryType[]
    updateValue: <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => void
    children?: ReactNode
}

export default function ProductFormFields({ values, categories, updateValue, children }: ProductFormFieldsProps) {
    const createCategoryValue = '__create_new_category__'
    const [localCategories, setLocalCategories] = useState(categories)
    const [isAddingCategory, setIsAddingCategory] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [categoryError, setCategoryError] = useState<string | null>(null)
    const [isCreatingCategory, setIsCreatingCategory] = useState(false)

    async function handleCreateCategory() {
        const normalizedName = newCategoryName.trim()

        if (!normalizedName) {
            return
        }

        setIsCreatingCategory(true)
        setCategoryError(null)

        try {
            const createdCategory = await addCategory(normalizedName)
            setLocalCategories((current) => {
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

    return (
        <>
            <div className='mb-4'>
                <label className='block mb-2'>Name:</label>
                <input type="text" value={values.name} placeholder="Product name" onChange={(e) => updateValue('name', e.target.value)} className='w-full border-1 p-2 rounded-md'/>
            </div>
            <div className='mb-4'>
                <label className='block mb-2'>Price:</label>
                <input type="number" value={values.price} placeholder="Price" onChange={(e) => updateValue('price', Number.parseFloat(e.target.value) || 0)} className='w-full border-1 p-2 rounded-md'/>
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
                    updateValue('category_id', e.target.value || null)
                }}
                className='w-full border-1 p-2 rounded-md'>
                    <option value="">Select category</option>
                    {localCategories.map((cat) => (
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
                <textarea value={values.description} placeholder="Product description" onChange={(e) => updateValue('description', e.target.value)} className='w-full border-1 p-2 rounded-md'/>
            </div>
            <div className='mb-4'>
                <label className='block mb-2'>Meta Title:</label>
                <input type="text" value={values.meta_title} placeholder="SEO title shown in search results" onChange={(e) => updateValue('meta_title', e.target.value)} className='w-full border-1 p-2 rounded-md'/>
            </div>
            <div className="mb-10">
                <label className='block mb-2'>Meta Description:</label>
                <textarea value={values.meta_description} placeholder="SEO description shown in search results" onChange={(e) => updateValue('meta_description', e.target.value)} className='w-full border-1 p-2 rounded-md'/>
            </div>
            {children}
        </>
    )
}
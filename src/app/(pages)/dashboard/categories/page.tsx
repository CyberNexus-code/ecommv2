import ListComponent from '@/components/dashboard/listcomponent'
import { getAllCategories } from '@/lib/items/get'
import AddcategoryModal from '@/components/dashboard/addcategoryModal';
import type { CategoryType } from '@/types/categoryType';

export default async function CategorieDashboard(){

    const { categories } = await getAllCategories();
    return (
        <div className='space-y-4'>
            <div className='flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-rose-200 bg-white p-4 shadow-sm'>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">Catalog</p>
                    <h1 className='text-2xl font-semibold text-rose-900'>Categories</h1>
                    <p className='text-sm text-stone-600'>Keep your product groupings organized.</p>
                </div>
                <div className="rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700">
                    {categories?.length ?? 0} categories
                </div>
            </div>
            <div className='rounded-2xl border border-rose-200 bg-white p-3 shadow-sm md:p-4'>
                {categories?.map((category: CategoryType) => (
                    <ListComponent key={category.id} props={{type: "categories", ...category}} />
                ))}
            </div>
            <AddcategoryModal />
        </div>
    )
}

import ListComponent from '@/components/dashboard/listcomponent'
import { getAllCategories } from '@/lib/supabase/get'

export default async function CategorieDashboard(){

    const { categories } = await getAllCategories();
    return (
        <div className='w-full p-2'>
            {categories?.map((category: any) => (
                <ListComponent key={category.id} props={{type: "categories", ...category}} />
            ))}
        </div>
    )
}
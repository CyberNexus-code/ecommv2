import { createServer } from "@/lib/supabase/server"
import ProductCard from "@/components/ProductCard/ProductCard"
import { getItemsByCategory } from "@/lib/supabase/getItems";
import AuthComponent from "@/components/AuthComponent/authComponent";

type Props = { params: Promise<{ categories: string }>};

export default async function ProductCategories({ params }: Props){

    const {categories} = await params;

    const {items, error} = await getItemsByCategory(categories)

    if(error){
        return <div>Error Loading Products</div>
    }

    if(!items || items.length === 0){
        return <div className="h-screen flex items-center justify-center">
            <h1 className="text-xl">No Items found</h1>
        </div>
    }

    return (
      <>
      <AuthComponent />
      <div className='max-w-7xl h-screen mx-auto px-4 py-8'>
        <h1 className='text-3xl font-bold mb-6'>Our Products</h1>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 px-10 sm:px-4 md:px-2 lg:px-0 xl:px-0'>
          {items.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </div>
      </>
    );
}
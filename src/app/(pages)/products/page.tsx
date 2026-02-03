import { createServer } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard/ProductCard';
import { getAllItems } from '@/lib/supabase/get';
import AuthComponent from '@/components/AuthComponent/authComponent';

export default async function Products(){

    const {items, error} = await getAllItems();

    if(!items || items.length === 0){
        return <div className='h-screen'>
            <h1>No Items found!</h1>
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
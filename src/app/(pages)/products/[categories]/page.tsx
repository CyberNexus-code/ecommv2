import ProductCard from "@/components/ProductCard/ProductCard"
import { getItemsByCategory } from "@/lib/items/get";
import AuthComponent from "@/components/AuthComponent/authComponent";

type Props = { params: { categories: string }};

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
        <div className='themed-scrollbar relative mx-auto h-[calc(100dvh-120px)] max-w-7xl overflow-y-auto px-4 py-8 pr-2 md:h-[calc(100dvh-140px)] md:px-6'>
          <div className='relative mb-6'>
            <h1 className='text-2xl font-semibold text-rose-900 md:text-3xl'>
              {categories.replace("-", " ")}
            </h1>
            <p className='text-sm text-rose-700/80 md:text-base'>Browse this category and add your favorites to basket.</p>
          </div>
          <div className='relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {items.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        </div>
        </>
      );
}

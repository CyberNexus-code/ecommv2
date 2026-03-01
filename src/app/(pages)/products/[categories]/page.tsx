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
        <div className='max-w-7xl mx-auto px-4 py-8 overflow-y-scroll no-scrollbar'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {items.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        </div>
        </>
      );
}
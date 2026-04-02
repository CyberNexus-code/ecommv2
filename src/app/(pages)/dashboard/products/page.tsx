import { getAllCategories, getAllItems } from "@/lib/items/get";
import { getAllTags } from "@/lib/items/tags";
import ListComponent from "@/components/dashboard/listcomponent";
import AddProductModal from "@/components/dashboard/addproductmodal";
import type { ItemType } from "@/types/itemType";

export default async function ProductsDashboard(){

    const {items} = await getAllItems();
    const {categories} = await getAllCategories();
  const {tags} = await getAllTags();

    if(items && items.length > 0){
        return (
            <div className="space-y-4">
               <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">Catalog</p>
                    <h1 className="text-2xl font-semibold text-rose-900">Products</h1>
                    <p className="text-sm text-stone-600">Manage product details, categories and media.</p>
                  </div>
                  <div className="rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700">
                    {items.length} items
                  </div>
               </div>
               <div className="rounded-2xl border border-rose-200 bg-white p-3 shadow-sm md:p-4">
               {items?.map((item: ItemType) => (
                <ListComponent key={item.id} props={{type: "products", ...item, catList:categories, allTags: tags}} />
                ))}
               </div>
               <AddProductModal catList={{catList: categories}}/>
            </div>
        );
    }else{
        return <div className="flex h-full items-center justify-center rounded-2xl border border-rose-200 bg-white p-8 shadow-sm">
            <h1 className="text-lg font-semibold text-rose-800">No items found...</h1>
            </div>
    }
}

import { getAllCategories, getAllItems } from "@/lib/items/get";
import { getAllTags } from "@/lib/items/tags";
import ListComponent from "@/components/dashboard/listcomponent";
import AddProductModal from "@/components/dashboard/addproductmodal";
import type { ItemType } from "@/types/itemType";

export default async function ProductsDashboard(){

    const {items} = await getAllItems({ includeInactive: true });
    const {categories} = await getAllCategories();
  const {tags} = await getAllTags();

    return (
        <div className="space-y-4">
           <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">Catalog</p>
                <h1 className="text-2xl font-semibold text-rose-900">Products</h1>
                <p className="text-sm text-stone-600">Manage product details, categories and media.</p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm font-medium">
                <div className="rounded-full bg-rose-50 px-3 py-1 text-rose-700">{items?.length ?? 0} items</div>
                <div className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">{items?.filter((item) => item.is_active).length ?? 0} live</div>
                <div className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">Price reviews tracked per item</div>
              </div>
           </div>

           {items && items.length > 0 ? (
            <>
               <div className="rounded-2xl border border-rose-200 bg-white p-3 shadow-sm md:p-4">
               {items.map((item: ItemType) => (
                <ListComponent key={item.id} props={{type: "products", ...item, catList:categories, allTags: tags}} />
                ))}
               </div>
              <AddProductModal catList={{catList: categories}} allTags={tags}/>
            </>
           ) : (
            <div className="rounded-2xl border border-dashed border-rose-300 bg-white p-8 shadow-sm">
              <div className="mx-auto flex max-w-md flex-col items-center text-center">
                <h2 className="text-xl font-semibold text-rose-900">No products yet</h2>
                <p className="mt-2 text-sm text-stone-600">Add your first product to start building the catalog shown on your storefront.</p>
                <AddProductModal
                    catList={{catList: categories}}
                  allTags={tags}
                    buttonLabel="Add product"
                    containerClassName="mt-6 flex justify-center"
                    buttonClassName="inline-flex items-center rounded-md border border-rose-700 bg-rose-700 px-4 py-2 text-sm font-medium text-white hover:bg-white hover:text-rose-700"
                />
              </div>
            </div>
           )}
        </div>
    );
}

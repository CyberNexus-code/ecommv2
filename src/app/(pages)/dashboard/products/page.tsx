import { getAllCategories, getAllItems } from "@/lib/supabase/get";
import ListComponent from "@/components/dashboard/listcomponent";
import AddProductModal from "@/components/dashboard/addproductmodal";
import { PlusIcon } from "@heroicons/react/24/outline";

export default async function ProductsDashboard(){

    const {items} = await getAllItems();
    const {categories} = await getAllCategories();

    if(items!.length > 0){
        return (
            <div className="w-full p-2">
               {items?.map((item: any) => (
                  <ListComponent key={item.id} props={{type: "products", ...item, catList:categories}} />
                ))}
               <AddProductModal catList={{catList: categories}}/>
            </div>
        );
    }else{
        return <div className="flex h-full justify-center items-center">
            <h1>No items found...</h1>
            </div>
    }
}
import { getAllItems } from "@/lib/supabase/getItems";

export default async function ProductsDashboard(){

    const items = await getAllItems();

    console.log(items);
    return (
        <div>
            <h2 className="text-xl font-semibold">Products Management</h2>
            <p>Here you can add, edit, or remove products from your catalog.</p>
        </div>
    );
}
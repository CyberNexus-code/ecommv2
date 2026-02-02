import { NextRequest, NextResponse } from "next/server";
import { createServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest){
    const { id, name, price, category_id } = await req.json();

    console.log("Product update was called!")

    const supabase = await createServer()
    const { data, error } =  await supabase.from('items').update({name, price, category_id}).eq('id', id).select();

    if(error) return NextResponse.json({error}, { status: 400});

    revalidatePath("/dashboard/products");

    return NextResponse.json({data});
}
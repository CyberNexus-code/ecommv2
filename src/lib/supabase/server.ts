'use server'

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServer() {
    const cookieStore = await cookies()

    console.log("Supabase server called")

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    console.log("supabase server cookies get all")
                    return cookieStore.getAll();
                }
            }
        }
    )
}
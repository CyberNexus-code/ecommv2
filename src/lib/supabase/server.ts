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
                },
                setAll(cookiesToSet) {
                    console.log("supabase server cookies set all")
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // setAll can be called in server component contexts where cookies are read-only.
                        // Middleware should refresh user sessions and set cookies in that case.
                    }
                }
            }
        }
    )
}

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest){
    let supabaseResponse = NextResponse.next({request});

    console.log("supabase proxy called");

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    console.log("Supabase proxy, Cookies get all called")
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet){
                    console.log("Supabase proxy, Cookies set all called")

                    cookiesToSet.forEach(({name, value}) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({request});
                    cookiesToSet.forEach(({name, value, options}) => supabaseResponse.cookies.set(name, value, options));
                }
            }
        }
    )

    return supabaseResponse
}
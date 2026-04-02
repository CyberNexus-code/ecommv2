import { createBrowserClient } from "@supabase/ssr";

function createBrowserSupabaseClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    )
}

let browserClient: ReturnType<typeof createBrowserSupabaseClient> | undefined;

export function createClient(){
    if (typeof window === "undefined") {
        return createBrowserSupabaseClient();
    }

    if (!browserClient) {
        browserClient = createBrowserSupabaseClient();
    }

    return browserClient;
}

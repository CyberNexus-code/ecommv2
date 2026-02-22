"use server"

import { createServer } from "@/lib/supabase/server"
import { redirect } from "next/navigation";

export async function logout() {
    const supabase = await createServer();
    await supabase.auth.signOut();
    redirect("/");
}
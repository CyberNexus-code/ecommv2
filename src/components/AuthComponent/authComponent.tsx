'use client'

import { createClient } from "@/lib/supabase/client";
import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";


export default function AuthComponent(){

    const supabase = useMemo(() => createClient(), []);
    const pathname = usePathname();

    const isAuthPage =
        pathname === "/login" ||
        pathname === "/signup" ||
        pathname === "/forgot-password" ||
        pathname === "/reset-password" ||
        pathname?.startsWith("/auth/");

    useEffect(() => {
        if(isAuthPage){
            return;
        }

        let active = true;

        const intiAnonymous = async () => {
            const { data: { session }} = await supabase.auth.getSession();

            if(!active) return;

            if(!session){
                await supabase.auth.signInAnonymously();
            }
        }

        intiAnonymous();

        return () => {
            active = false;
        };

    }, [isAuthPage, supabase])
   
   
    return <></>
}

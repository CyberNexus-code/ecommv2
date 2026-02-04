'use client'

import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";


export default function AuthComponent(){

    const supabase = createClient();

    useEffect(() => {
        const intiAnonymous = async () => {
            const { data: { session }} = await supabase.auth.getSession();

            if(!session){
                console.log("No user logged in, signing in anonymously");
                await supabase.auth.signInAnonymously();
            }
            // else if(session.user.is_anonymous){
            //     console.log("user is signed in anonymously!")
            // }
            // else{
            //     console.log("User already logged in:", session.user);
            // }
        }

        intiAnonymous();

    }, [supabase.auth])
   
   
    return <></>
}
"use server"

import { sendContactEmail } from "@/lib/email/sendContactEmail"

export type ContactFormState = {
    success: boolean
    error: string | null
}

export async function submitContactForm(prevState: ContactFormState, formData: FormData): Promise<ContactFormState>{
    
    try{

        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const message = formData.get("message") as string;

        
        if(!name || !email || !message){
            throw new Error("All fields are required.");
        }

        await sendContactEmail({name, email, message})

        return { success: true, error: null }
            
    }catch(error){
        console.error("Error sending email:", error);
        return { success: false, error: "Failed to send message."}
    }
}
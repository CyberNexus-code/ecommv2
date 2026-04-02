"use client"

import { useActionState } from "react";
import Link from "next/link"
import { submitContactForm } from "@/app/_actions/contactActions"

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-rose-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
    >
      {pending ? "Sending..." : "Send Message"}
    </button>
  )
}


const initialState = {
    success: false,
    error: null
}

export default function ContactForm(){
    
    const [state, action, pending] = useActionState(submitContactForm, initialState)

    if(state.success){
        return (
        <div className="bg-white p-6 rounded-2xl shadow-sm text-center space-y-4">
            <h2 className="text-xl font-semibold text-green-600">
            Message Sent Successfully!
            </h2>
            <div className="flex justify-center gap-4">
            <Link
                href="/products"
                className="bg-rose-700 text-white px-4 py-2 rounded-lg"
            >
                Continue Shopping
            </Link>
            <Link
                href="/"
                className="border border-rose-700 text-rose-700 px-4 py-2 rounded-lg"
            >
                Go Home
            </Link>
            </div>
        </div>
        )
    }
    
    return (
          <form
          action={action}
        className="space-y-4 bg-white p-6 rounded-2xl shadow-sm m-auto md:max-w-200"
      >
        <div>
          <label htmlFor="contact-name" className="block mb-1 text-sm font-medium">Name</label>
          <input
            id="contact-name"
            name="name"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="block mb-1 text-sm font-medium">Email</label>
          <input
            id="contact-email"
            type="email"
            name="email"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="contact-message" className="block mb-1 text-sm font-medium">Message</label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={5}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        <SubmitButton pending={pending}/>
      </form>
    )
}
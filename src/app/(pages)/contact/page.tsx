import type { Metadata } from "next";
import ContactForm from "@/components/contactForm/ContactForm"

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Cute & Creative Toppers for custom cake topper requests, party decor questions, and order support.",
  alternates: {
    canonical: '/contact',
  },
}

export default function ContactPage() {
  return (
    <section className="w-9/10 md:w-2/3 mx-auto md:px-4 md:py-16 md:max-w-200" aria-labelledby="contact-heading">
      <h1 id="contact-heading" className="text-3xl font-bold mb-6">Contact Us</h1>
      <ContactForm />    
    </section>
  )
}

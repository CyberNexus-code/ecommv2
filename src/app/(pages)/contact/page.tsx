import ContactForm from "@/components/contactForm/ContactForm"

export default function ContactPage() {
  return (
    <div className="w-9/10 md:w-2/3 mx-auto md:px-4 md:py-16 md:max-w-200">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <ContactForm />    
    </div>
  )
}

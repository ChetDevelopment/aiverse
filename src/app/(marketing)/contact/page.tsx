import type { Metadata } from "next"
import { ContactForm } from "./form"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the AIVerse team.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Contact Us</h1>
        <p className="text-muted-foreground mb-8">
          Have a question, suggestion, or want to list your AI tool? We&apos;d
          love to hear from you.
        </p>
        <ContactForm />
      </div>
    </div>
  )
}

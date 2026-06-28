import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service",
  robots: { index: false, follow: true },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Terms of Service</h1>
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-4 text-muted-foreground">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>By accessing and using AIVerse, you agree to be bound by these Terms of Service.</p>
          <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
          <p>AIVerse provides a directory and discovery platform for AI tools. We do not endorse or guarantee any tools listed on our platform.</p>
          <h2 className="text-xl font-semibold text-foreground">3. User Obligations</h2>
          <p>You agree to provide accurate information when creating an account and to not use the service for any unlawful purpose.</p>
          <h2 className="text-xl font-semibold text-foreground">4. Intellectual Property</h2>
          <p>The content on AIVerse, including our logo and design, is protected by copyright and other intellectual property laws.</p>
          <h2 className="text-xl font-semibold text-foreground">5. Limitation of Liability</h2>
          <p>AIVerse is provided &quot;as is&quot; without any warranty. We are not liable for any damages arising from your use of the service.</p>
        </div>
      </div>
    </div>
  )
}

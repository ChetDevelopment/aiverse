import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: false, follow: true },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Privacy Policy</h1>
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-4 text-muted-foreground">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, including your name, email address, and profile information when you create an account.</p>
          <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, to send you technical notices and support messages, and to communicate with you about products and services.</p>
          <h2 className="text-xl font-semibold text-foreground">3. Data Sharing</h2>
          <p>We do not share your personal information with third parties except as described in this policy or with your consent.</p>
          <h2 className="text-xl font-semibold text-foreground">4. Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information.</p>
          <h2 className="text-xl font-semibold text-foreground">5. Contact</h2>
          <p>If you have questions about this policy, please contact us at privacy@aiverse.ai.</p>
        </div>
      </div>
    </div>
  )
}

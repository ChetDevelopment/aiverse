import type { Metadata } from "next"
import { Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "About",
  description: "Learn about AIVerse — the world's best platform for discovering AI tools.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">About AIVerse</h1>
        </div>
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
          <p className="text-lg text-muted-foreground">
            AIVerse is the world&apos;s most comprehensive AI tools directory.
            We help millions of users discover, compare, and choose the perfect
            AI tools for their needs.
          </p>
          <h2 className="text-2xl font-semibold mt-8">Our Mission</h2>
          <p className="text-muted-foreground">
            Make AI accessible to everyone. We believe the right AI tool can
            transform how you work, create, and solve problems. Our platform
            removes the guesswork from choosing AI tools by providing transparent
            pricing, authentic reviews, and detailed comparisons.
          </p>
          <h2 className="text-2xl font-semibold mt-8">Why AIVerse?</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li><strong>Comprehensive:</strong> Thousands of AI tools across every category</li>
            <li><strong>Transparent:</strong> Clear pricing, no hidden costs</li>
            <li><strong>Trustworthy:</strong> Real reviews from real users</li>
            <li><strong>Fast:</strong> Lightning-fast search and filtering</li>
            <li><strong>Free:</strong> Access to our entire directory at no cost</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

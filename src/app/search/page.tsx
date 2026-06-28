import { Suspense } from "react"
import type { Metadata } from "next"
import { SearchPageClient } from "./client"

export const metadata: Metadata = {
  title: "Search AI Tools",
  description:
    "Search and filter AI tools by category, pricing, features, and popularity.",
}

export const revalidate = 300

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageClient />
    </Suspense>
  )
}

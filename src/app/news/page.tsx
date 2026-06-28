import type { Metadata } from "next"
import { NewsSection } from "@/components/news/news-section"

export const metadata: Metadata = {
  title: "Tech News",
  description: "Latest tech and AI news curated from Hacker News and other sources.",
}

export default function NewsPage() {
  return <NewsSection />
}

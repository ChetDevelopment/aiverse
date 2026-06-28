import type { Metadata } from "next"
import { TrendingClient } from "./client"

export const metadata: Metadata = {
  title: "Trending AI Projects",
  description: "Trending AI and open-source projects discovered from GitHub.",
}

export const dynamic = "force-dynamic"

export default function TrendingPage() {
  return <TrendingClient />
}

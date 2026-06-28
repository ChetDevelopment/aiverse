"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Check, X, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface CompareTool {
  id: string; name: string; slug: string; tagline: string; description: string
  pricing: string; pricingDetail: string | null; startingPrice: number | null
  websiteUrl: string; viewCount: number
  pros: { id: string; text: string }[]
  cons: { id: string; text: string }[]
  categories: { category: { name: string } }[]
  reviews: { rating: number }[]
}

export function CompareContent() {
  const searchParams = useSearchParams()
  const [tools, setTools] = useState<CompareTool[]>([])
  const [loading, setLoading] = useState(true)
  const slugs = useMemo(
    () => (searchParams.get("tools")?.split(",") || []).slice(0, 3),
    [searchParams]
  )

  const [fetchErrors, setFetchErrors] = useState<string[]>([])
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setFetchErrors([])
      const results = await Promise.all(
        slugs.map(async (slug) => {
          try {
            const res = await fetch(`/api/tools/${slug}`)
            const data = await res.json()
            if (!res.ok || !data?.id) { setFetchErrors((prev) => [...prev, slug]); return null }
            return data
          } catch { setFetchErrors((prev) => [...prev, slug]); return null }
        })
      )
      if (!cancelled) setTools(results.filter(Boolean))
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [slugs])

  const avgRating = (tool: CompareTool) =>
    tool.reviews.length > 0
      ? tool.reviews.reduce((a, r) => a + r.rating, 0) / tool.reviews.length
      : 0

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link href="/search" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to search
        </Link>
        <h1 className="text-3xl font-bold mb-8">Compare AI Tools</h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-96 rounded-xl" />)}
          </div>
        ) : tools.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">{slugs.length > 0 ? "Could not load the selected tools." : "No tools selected for comparison."}</p>
            {fetchErrors.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">Failed to load: {fetchErrors.join(", ")}</p>
            )}
            <Link href="/search"><Button className="mt-4">Browse Tools</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Card key={tool.id} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-lg font-bold text-primary">
                    {tool.name.charAt(0)}
                  </div>
                  <div>
                    <Link href={`/ai-tool/${tool.slug}`} className="font-semibold hover:text-primary">
                      {tool.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{tool.tagline}</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Pricing</span><Badge variant={tool.pricing === "FREE" ? "success" : "default"}>{tool.pricing}</Badge></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Rating</span><span>{avgRating(tool) > 0 ? `${avgRating(tool).toFixed(1)}/5` : "N/A"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Views</span><span>{tool.viewCount.toLocaleString()}</span></div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Pros</p>
                  {tool.pros.slice(0, 3).map((p) => (
                    <div key={p.id} className="flex items-start gap-2 text-xs text-muted-foreground mb-1">
                      <Check className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />{p.text}
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Cons</p>
                  {tool.cons.slice(0, 3).map((c) => (
                    <div key={c.id} className="flex items-start gap-2 text-xs text-muted-foreground mb-1">
                      <X className="h-3 w-3 text-destructive mt-0.5 shrink-0" />{c.text}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

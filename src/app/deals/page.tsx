"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { ShieldCheck, Star, TrendingUp, Search, Sparkles, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

const DEAL_TYPES = [
  { id: "", label: "All Deals" },
  { id: "free-tier", label: "Free Tier" },
  { id: "promo-code", label: "Promo Code" },
  { id: "lifetime-deal", label: "Lifetime Deal" },
  { id: "open-source", label: "Open Source" },
  { id: "student", label: "Student Deal" },
]

const badgeMap: Record<string, { label: string; color: "success" | "warning" | "default" | "secondary" }> = {
  "free-tier": { label: "Free Tier", color: "success" },
  "promo-code": { label: "Promo Code", color: "warning" },
  "lifetime-deal": { label: "Lifetime Deal", color: "default" },
  "open-source": { label: "Open Source", color: "success" },
  student: { label: "Student Deal", color: "secondary" },
}

interface Deal {
  id: string; toolName: string; toolSlug: string; description: string
  dealType: string; promoCode: string | null; verified: boolean
  tool: { name: string; slug: string; logo: string | null; pricing: string; viewCount: number } | null
}

const PAGE_SIZE = 12

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetch("/api/deals").then((r) => r.json()).then((data) => {
      const items = data?.data ?? data?.deals ?? (Array.isArray(data) ? data : [])
      setDeals(items)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let result = deals
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((d) =>
        d.toolName.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
      )
    }
    if (filterType) result = result.filter((d) => d.dealType === filterType)
    return result
  }, [deals, search, filterType])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const safePage = Math.min(page, Math.max(totalPages, 1))
  const displayDeals = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="h-8 w-8 text-emerald-500" />
          <h1 className="text-3xl font-bold tracking-tight">Free AI Deals</h1>
        </div>
        <p className="text-muted-foreground mb-6 max-w-xl">
          Curated and verified by our team. Every deal is researched to ensure it&apos;s ethical, genuinely useful, and respects your privacy.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search deals by name or description..."
              className="pl-9 h-10"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1 flex-wrap">
            {DEAL_TYPES.map((t) => (
              <button key={t.id} onClick={() => { setFilterType(t.id); setPage(1) }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all",
                  filterType === t.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >{t.label}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4">
                <Skeleton className="h-10 w-10 rounded-xl mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-3" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent></Card>
            ))}
          </div>
        ) : displayDeals.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No deals found"
            description={search || filterType ? "No deals match your search or filter. Try different keywords or browse all deals." : "No deals are available right now. Check back soon for new offers."}
            action={(search || filterType) ? <Button variant="outline" onClick={() => { setSearch(""); setFilterType(""); setPage(1) }}><RefreshCw className="mr-2 h-4 w-4" />Clear Filters</Button> : undefined}
          />
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Showing {displayDeals.length} of {filtered.length} deal{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {displayDeals.map((deal) => {
                const badge = badgeMap[deal.dealType] || { label: deal.dealType, color: "secondary" as const }
                const href = deal.tool?.slug ? `/ai-tool/${deal.tool.slug}` : `/repo/${deal.toolSlug}`

                return (
                  <Link key={deal.id} href={href}>
                    <Card className="h-full hover:shadow-md hover:border-primary/20 transition-all duration-200">
                      <CardContent className="p-4 flex flex-col h-full">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-secondary text-sm font-bold overflow-hidden">
                            {deal.tool?.logo ? (
                              <Image src={deal.tool.logo} alt={deal.toolName} width={40} height={40} className="h-full w-full object-contain p-1" />
                            ) : (
                              deal.toolName.charAt(0)
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{deal.toolName}</p>
                            <Badge variant={badge.color} className="text-[10px] mt-0.5">{badge.label}</Badge>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-3 flex-1 mb-3">
                          {deal.description}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t">
                          {deal.promoCode && (
                            <code className="bg-secondary px-1.5 py-0.5 rounded text-[10px] font-mono">
                              {deal.promoCode}
                            </code>
                          )}
                          <div className="flex items-center gap-2 ml-auto">
                            {deal.tool && (
                              <>
                                <span className="flex items-center gap-0.5"><Star className="h-2.5 w-2.5" />{deal.tool.viewCount}</span>
                                <span className="flex items-center gap-0.5"><TrendingUp className="h-2.5 w-2.5" />{deal.tool.pricing}</span>
                              </>
                            )}
                            <Badge variant={deal.verified ? "success" : "secondary"} className="text-[9px]">
                              {deal.verified ? "Verified" : "Pending"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-8">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} aria-label="Previous page"
                  className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-accent transition-colors"
                ><ChevronLeft className="h-4 w-4" /></button>
                {(() => {
                  const pages: (number | "...")[] = []
                  const range = 2
                  for (let i = 1; i <= totalPages; i++) {
                    if (i === 1 || i === totalPages || (i >= page - range && i <= page + range)) {
                      pages.push(i)
                    } else if (pages[pages.length - 1] !== "...") {
                      pages.push("...")
                    }
                  }
                  return pages.map((p, i) =>
                    p === "..." ? (
                      <span key={`e${i}`} className="px-2 text-muted-foreground text-sm">...</span>
                    ) : (
                      <button key={p} onClick={() => setPage(p)}
                        className={cn("px-3 py-1.5 rounded-lg text-sm border transition-colors hover:bg-accent",
                          p === page ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90" : ""
                        )}
                      >{p}</button>
                    )
                  )
                })()}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} aria-label="Next page"
                  className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-accent transition-colors"
                ><ChevronRight className="h-4 w-4" /></button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

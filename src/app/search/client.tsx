"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ToolCard } from "@/components/home/tool-card"
import { Skeleton } from "@/components/ui/skeleton"
import { CompareButton } from "@/components/shared/compare-button"
import { CompareBar } from "@/components/shared/compare-bar"
import { useCompare } from "@/hooks/use-compare"
import { useDebounce } from "@/hooks/use-debounce"
import type { ToolCardData, PaginatedResponse } from "@/types"

const PRICING_OPTIONS = [
  { value: "", label: "All Pricing" },
  { value: "FREE", label: "Free" },
  { value: "FREEMIUM", label: "Freemium" },
  { value: "PAID", label: "Paid" },
] as const

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest Rated" },
] as const

interface CategoryItem {
  slug: string
  name: string
}

export function SearchPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = React.useState(searchParams.get("q") || "")
  const debouncedQuery = useDebounce(query, 250)
  const [suggestions, setSuggestions] = React.useState<{ tools: { name: string; slug: string; tagline: string; pricing: string }[]; categories: { name: string; slug: string }[] } | null>(null)
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const searchRef = React.useRef<HTMLDivElement>(null)
  const [category, setCategory] = React.useState(searchParams.get("category") || "")
  const [pricing, setPricing] = React.useState(searchParams.get("pricing") || "")
  const [sort, setSort] = React.useState(searchParams.get("sort") || "popular")
  const [page, setPage] = React.useState(1)
  const [results, setResults] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [categories, setCategories] = React.useState<CategoryItem[]>([])
  const [showFilters, setShowFilters] = React.useState(false)

  React.useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        const items = data?.data ?? (Array.isArray(data) ? data : [])
        if (items.length) {
          setCategories(
            items.map((c: { slug: string; name: string }) => ({
              slug: c.slug,
              name: c.name,
            }))
          )
        }
      })
      .catch((error: unknown) => {
        console.error("[SEARCH] Failed to load categories", error)
      })
  }, [])

  React.useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedQuery) params.set("q", debouncedQuery)
    if (category) params.set("category", category)
    if (pricing) params.set("pricing", pricing)
    if (sort) params.set("sort", sort)
    params.set("page", String(page))

    const controller = new AbortController()

    async function fetchResults() {
      setLoading(true)
      try {
        const res = await fetch(`/api/tools?${params.toString()}`, {
          signal: controller.signal,
        })
        const data = await res.json()
        if (!controller.signal.aborted) {
          setResults(data)
        }
      } catch {
        if (!controller.signal.aborted) {
          setResults(null)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchResults()

    return () => controller.abort()
  }, [debouncedQuery, category, pricing, sort, page])

  React.useEffect(() => {
    if (debouncedQuery.length < 2) {
      return
    }
    const controller = new AbortController()
    fetch(`/api/tools/suggest?q=${encodeURIComponent(debouncedQuery)}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => { if (!controller.signal.aborted) setSuggestions(data) })
      .catch((error: unknown) => {
        console.error("[SEARCH] Failed to load suggestions", error)
      })
    return () => controller.abort()
  }, [debouncedQuery])

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const didMount = React.useRef(false)
  React.useEffect(() => {
    if (didMount.current) {
      const params = new URLSearchParams()
      if (query) params.set("q", query)
      if (category) params.set("category", category)
      if (pricing) params.set("pricing", pricing)
      if (sort) params.set("sort", sort)
      const qs = params.toString()
      router.replace(`/search${qs ? `?${qs}` : ""}`, { scroll: false })
    }
    didMount.current = true
  }, [query, category, pricing, sort, router])

  function clearFilters() {
    setQuery("")
    setCategory("")
    setPricing("")
    setSort("popular")
    setPage(1)
  }

  const hasFilters = category || pricing || sort !== "popular"
  const compare = useCompare()

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl mb-8" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search AI tools..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              className="h-12 pl-12 pr-4 rounded-xl text-base"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("")
                  setPage(1)
                  setSuggestions(null)
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {showSuggestions && suggestions && (suggestions.tools.length > 0 || suggestions.categories.length > 0) && (
              <div className="absolute top-full mt-1 left-0 right-0 rounded-xl border bg-background shadow-lg z-50 overflow-hidden">
                {suggestions.tools.length > 0 && (
                  <div className="p-2">
                    <p className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">AI Tools</p>
                    {suggestions.tools.map((t) => (
                      <Link key={t.slug} href={`/ai-tool/${t.slug}`} onClick={() => setShowSuggestions(false)}
                        className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent transition-colors">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-xs font-bold text-primary">{t.name.charAt(0)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{t.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{t.tagline}</p>
                        </div>
                        <Badge variant={t.pricing === "FREE" ? "success" : "secondary"} className="text-[10px]">{t.pricing}</Badge>
                      </Link>
                    ))}
                  </div>
                )}
                {suggestions.categories.length > 0 && (
                  <div className="p-2 border-t">
                    <p className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Categories</p>
                    {suggestions.categories.map((c) => (
                      <Link key={c.slug} href={`/categories/${c.slug}`} onClick={() => setShowSuggestions(false)}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent transition-colors">
                        {c.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <div className="hidden lg:flex items-center gap-2">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  setPage(1)
                }}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={pricing}
                onChange={(e) => {
                  setPricing(e.target.value)
                  setPage(1)
                }}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              >
                {PRICING_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value)
                  setPage(1)
                }}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                <X className="mr-1 h-3 w-3" />
                Clear
              </Button>
            )}
            {results && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                {results.total} result{results.total !== 1 ? "s" : ""}
                {results.fromGitHub && (
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">from GitHub</Badge>
                )}
              </p>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="lg:hidden mb-6 p-4 rounded-xl border space-y-3">
            <div>
              <p className="text-sm font-medium mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={category === "" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setCategory("")}
                >
                  All
                </Badge>
                {categories.map((c) => (
                  <Badge
                    key={c.slug}
                    variant={category === c.slug ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setCategory(c.slug === category ? "" : c.slug)
                      setPage(1)
                    }}
                  >
                    {c.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Pricing</p>
              <div className="flex flex-wrap gap-2">
                {PRICING_OPTIONS.map((opt) => (
                  <Badge
                    key={opt.value}
                    variant={pricing === opt.value ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setPricing(pricing === opt.value ? "" : opt.value)
                      setPage(1)
                    }}
                  >
                    {opt.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Sort</p>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((opt) => (
                  <Badge
                    key={opt.value}
                    variant={sort === opt.value ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setSort(opt.value)
                      setPage(1)
                    }}
                  >
                    {opt.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border p-5">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : results && results.items.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.items.map((tool: any, i: number) => (
                <div key={tool.id} className="relative">
                  <ToolCard tool={tool} index={i} />
                  <div className="absolute top-2 right-2">
                    <CompareButton
                      slug={tool.slug}
                      isInCompare={compare.isInCompare(tool.slug)}
                      onToggle={compare.addToCompare}
                    />
                  </div>
                </div>
              ))}
            </div>

            <CompareBar
              slugs={compare.slugs}
              onRemove={compare.removeFromCompare}
              onClear={compare.clearCompare}
              onCompare={compare.goToCompare}
            />

            {results.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: results.totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === results.totalPages ||
                      Math.abs(p - page) <= 2
                  )
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="text-muted-foreground px-1">...</span>
                      )}
                      <Button
                        variant={p === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(p)}
                        className="w-9"
                      >
                        {p}
                      </Button>
                    </React.Fragment>
                  ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= results.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-lg text-muted-foreground">No tools found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

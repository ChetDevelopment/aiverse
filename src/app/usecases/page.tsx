"use client"

import * as React from "react"
import Link from "next/link"
import { Search, Clock, Layers, Sparkles, PenTool, Code2, Briefcase, BookOpen, Palette, FlaskConical, Megaphone, Zap, RefreshCw } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { useDebounce } from "@/hooks/use-debounce"

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Content Creation": PenTool,
  Development: Code2,
  Business: Briefcase,
  Learning: BookOpen,
  Design: Palette,
  Research: FlaskConical,
  Marketing: Megaphone,
  Productivity: Zap,
}

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "Content Creation", label: "Content Creation", icon: "PenTool" },
  { value: "Development", label: "Development", icon: "Code2" },
  { value: "Business", label: "Business", icon: "Briefcase" },
  { value: "Learning", label: "Learning", icon: "BookOpen" },
  { value: "Design", label: "Design", icon: "Palette" },
  { value: "Research", label: "Research", icon: "FlaskConical" },
  { value: "Marketing", label: "Marketing", icon: "Megaphone" },
  { value: "Productivity", label: "Productivity", icon: "Zap" },
]

const DIFFICULTY_COLORS: Record<string, "success" | "warning" | "default"> = {
  beginner: "success",
  intermediate: "warning",
  advanced: "default",
}

export default function UseCasesPage() {
  const [query, setQuery] = React.useState("")
  const [category, setCategory] = React.useState("")
  const [useCases, setUseCases] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const debouncedQuery = useDebounce(query, 250)

  React.useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedQuery) params.set("q", debouncedQuery)
    if (category) params.set("category", category)

    const controller = new AbortController()

    async function fetchUseCases() {
      setLoading(true)
      try {
        const res = await fetch(`/api/usecases?${params.toString()}`, {
          signal: controller.signal,
        })
        const data = await res.json()
        if (!controller.signal.aborted) setUseCases(data.data)
      } catch {
        if (!controller.signal.aborted) setUseCases([])
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    fetchUseCases()
    return () => controller.abort()
  }, [debouncedQuery, category])

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Use Case Explorer
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover how AI tools can solve real-world problems, step by step
          </p>
        </div>

        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search use cases..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 pl-12 pr-4 rounded-xl text-base"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value === category ? "" : cat.value)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                category === cat.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat.icon && (() => {
                const IconComponent = CATEGORY_ICONS[cat.label] || null
                return IconComponent ? <IconComponent className="h-4 w-4" /> : null
              })()}
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : useCases.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((uc) => (
              <Link key={uc.id} href={`/usecases/${uc.slug}`}>
                <Card className="h-full hover:shadow-md transition-all duration-200 group">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-xl mb-4 group-hover:scale-110 transition-transform">
                      {uc.icon || <Sparkles className="h-5 w-5" />}
                    </div>
                    <h3 className="font-semibold text-lg mb-1.5">{uc.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                      {uc.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-auto">
                      <Badge variant={DIFFICULTY_COLORS[uc.difficulty] || "default"}>
                        {uc.difficulty}
                      </Badge>
                      {uc.estimatedTime && (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {uc.estimatedTime}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="gap-1 ml-auto">
                        <Layers className="h-3 w-3" />
                        {uc._count.tools} tools
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="No use cases found"
            description={query || category ? "No use cases match your search. Try different keywords or browse all categories." : "Use cases are being added. Check back soon!"}
            action={(query || category)
              ? <Button variant="outline" onClick={() => { setQuery(""); setCategory("") }}><RefreshCw className="mr-2 h-4 w-4" />Clear Filters</Button>
              : <Link href="/learn"><Button variant="outline"><BookOpen className="mr-2 h-4 w-4" />Explore Learning Paths</Button></Link>
            }
          />
        )}
      </div>
    </div>
  )
}

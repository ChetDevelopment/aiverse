"use client"

import { useState, useEffect, Fragment } from "react"
import { Sparkles, Star, GitFork, Clock, Search, Tag, Globe, ChevronLeft, ChevronRight, BookOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"

interface Project {
  id: string; repoName: string; repoOwner: string; fullName: string
  githubUrl: string; description: string | null; stars: number; forks: number
  language: string | null; topics: string | null; license: string | null
  category: string | null; logoUrl: string | null; lastPushAt: string
}

const FILTERS = [
  { id: "", label: "All", icon: Globe },
  { id: "llms", label: "LLMs & Models", icon: Sparkles },
  { id: "chat-ai", label: "Chat AI", icon: Sparkles },
  { id: "image", label: "Vision & Image", icon: Sparkles },
  { id: "ai-agents", label: "Agents & Auto", icon: Sparkles },
  { id: "coding", label: "Coding & Dev", icon: Sparkles },
  { id: "video", label: "Video & Motion", icon: Sparkles },
  { id: "voice", label: "Audio & Speech", icon: Sparkles },
  { id: "automation", label: "Automation", icon: Sparkles },
  { id: "education", label: "Research & Edu", icon: BookOpen },
  { id: "productivity", label: "Tools & Libs", icon: Tag },
]

const SORTS = [
  { id: "stars", label: "Most Stars" },
  { id: "updated", label: "Recently Updated" },
  { id: "newest", label: "Newest First" },
]

const CATEGORY_LABELS: Record<string, string> = {
  "llms": "LLMs & Models", "chat-ai": "Chat AI", "image": "Vision & Image",
  "ai-agents": "Agents & Automation", "coding": "Coding & Dev",
  "video": "Video & Motion", "voice": "Audio & Speech",
  "automation": "Automation", "education": "Research & Edu",
  "productivity": "Tools & Libraries", "marketing": "Marketing",
  "writing": "Writing", "business": "Business", "open-source": "Open Source",
  "local-ai": "Local AI",
}

export default function DiscoverPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [category, setCategory] = useState("")
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("stars")
  const [categories, setCategories] = useState<Record<string, number>>({})
  const debouncedSearch = useDebounce(search, 300)
  const fetchKey = `${category}|${sort}|${debouncedSearch}|${page}`

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: "20", sort })
    if (category) params.set("category", category)
    if (debouncedSearch) params.set("q", debouncedSearch)
    let cancelled = false
    fetch(`/api/discover/projects?${params}`).then((r) => r.json()).then((data) => {
      if (cancelled) return
      if (data?.items) { setProjects(data.items); setTotal(data.total); setTotalPages(data.totalPages) }
      if (data?.categories) setCategories(data.categories)
      setLoading(false)
    }).catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [fetchKey])

  const totalDisplay = total.toLocaleString()

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Sparkles className="h-7 w-7 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">AI Open Source Projects</h1>
            </div>
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">{totalDisplay}</span> auto-discovered projects from GitHub
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search projects..."
                className="pl-9 h-9 text-sm"
              />
            </div>
            <select
              value={sort} onChange={(e) => { setSort(e.target.value); setPage(1) }}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            >
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto scrollbar-hide pb-1 flex-wrap">
          {FILTERS.map((f) => {
            const count = f.id ? (categories[f.id] || 0) : total
            return (
              <button key={f.id} onClick={() => { setCategory(f.id); setPage(1) }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all",
                  category === f.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                )}
              >
                <f.icon className="h-3.5 w-3.5" />
                {f.label}
                <span className="text-[10px] opacity-70">({count.toLocaleString()})</span>
              </button>
            )
          })}
        </div>

        {/* Results count bar */}
        <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
          <span>{loading ? "Loading..." : `${total.toLocaleString()} projects`}</span>
          {projects.length > 0 && (
            <span className="text-xs">Page {page} of {totalPages}</span>
          )}
        </div>

        {/* Project grid */}
        {loading && projects.length === 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="overflow-hidden"><CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <div className="flex gap-2"><Skeleton className="h-5 w-14" /><Skeleton className="h-5 w-14" /><Skeleton className="h-5 w-14" /></div>
              </CardContent></Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-lg text-muted-foreground">No projects found</p>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {projects.map((project) => (
                <a key={project.id} href={`/repo/${encodeURIComponent(project.fullName)}`} className="group">
                  <Card className="h-full hover:shadow-md hover:border-primary/20 transition-all duration-200">
                    <CardContent className="p-4 flex flex-col h-full">
                      {/* Top */}
                      <div className="flex items-start gap-3 mb-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-secondary text-sm font-bold overflow-hidden">
                          {project.logoUrl ? (
                            <img src={project.logoUrl} alt="" className="h-full w-full object-contain p-0.5" loading="lazy" />
                          ) : project.repoName.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                            {project.repoOwner}/{project.repoName}
                          </p>
                          {project.category && (
                            <Badge variant="outline" className="text-[9px] h-4 mt-0.5">
                              {CATEGORY_LABELS[project.category] || project.category}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-muted-foreground line-clamp-3 mb-3 flex-1">
                        {project.description || "No description available"}
                      </p>

                      {/* Stats row */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t">
                        <span className="flex items-center gap-1"><Star className="h-3 w-3" />{project.stars.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><GitFork className="h-3 w-3" />{project.forks.toLocaleString()}</span>
                        {project.language && <span className="truncate">{project.language}</span>}
                        {project.license && <span className="truncate">{project.license}</span>}
                      </div>

                      {/* Topics */}
                      {project.topics && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.topics.split(",").slice(0, 3).map((t) => (
                            <span key={t.trim()} className="text-[9px] bg-secondary px-1.5 py-0.5 rounded truncate max-w-[80px]">
                              {t.trim()}
                            </span>
                          ))}
                          {project.topics.split(",").length > 3 && (
                            <span className="text-[9px] text-muted-foreground">+{project.topics.split(",").length - 3}</span>
                          )}
                        </div>
                      )}

                      {/* Last updated */}
                      {project.lastPushAt && (
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground/60">
                          <Clock className="h-3 w-3" />
                          Updated {new Date(project.lastPushAt).toLocaleDateString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .map((p, idx, arr) => (
                    <Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-muted-foreground px-1">···</span>}
                      <Button variant={p === page ? "default" : "outline"} size="sm" onClick={() => setPage(p)} className="w-9">{p}</Button>
                    </Fragment>
                  ))}
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}

        <p className="text-center text-[10px] text-muted-foreground/40 mt-6">
          Data sourced from GitHub · Updated daily · {total.toLocaleString()} open-source AI projects
        </p>
      </div>
    </div>
  )
}

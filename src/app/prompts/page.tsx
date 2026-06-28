"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Filter, FileText, BookOpen, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { PromptCard } from "@/components/prompts/prompt-card"
import { useToast } from "@/components/toast"

interface Prompt {
  id: string
  title: string
  content: string
  description: string | null
  category: string | null
  difficulty: string
  isOfficial: boolean
  avgRating: number
  ratingCount: number
  useCount: number
  tool: { id: string; name: string; slug: string; logo: string | null }
  user: { id: string; name: string | null; avatarUrl: string | null } | null
  _count: { favorites: number }
}

const CATEGORIES = [
  "writing", "coding", "analysis", "creative", "business", "education", "other",
]

const DIFFICULTIES = ["beginner", "intermediate", "advanced"]

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const { showToast } = useToast()

  useEffect(() => {
    const fetchPrompts = async () => {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (category) params.set("category", category)
      if (difficulty) params.set("difficulty", difficulty)

      try {
        const res = await fetch(`/api/prompts?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setPrompts(data.items)
        }
      } catch {
        showToast("Failed to load prompts", "error")
      }
      setLoading(false)
    }
    fetchPrompts()
  }, [search, category, difficulty, showToast])

  async function handleFavoriteToggle(id: string) {
    try {
      const res = await fetch(`/api/prompts/${id}/favorite`, { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        setFavorites((prev) => {
          const next = new Set(prev)
          if (data.favorited) next.add(id)
          else next.delete(id)
          return next
        })
        showToast(data.favorited ? "Saved" : "Unsaved", "success")
      }
    } catch {
      showToast("Failed to update", "error")
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Prompt Library</h1>
          <p className="mt-2 text-muted-foreground">
            Browse and discover prompts for your AI tools
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0" aria-label="Filter prompts">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setCategory(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              !category ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(category === cat ? null : cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
                category === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficulty(difficulty === diff ? null : diff)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
                difficulty === diff ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border p-5 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : prompts.length === 0 ? (
          <EmptyState
            icon={search || category || difficulty ? Search : FileText}
            title={search || category || difficulty ? "No prompts match your search" : "No prompts yet"}
            description={search || category || difficulty ? "No prompts match your filters. Try different keywords, categories, or difficulty levels." : "The prompt library is growing. Prompts crafted by the community will appear here once available."}
            action={(search || category || difficulty)
              ? <Button variant="outline" onClick={() => { setSearch(""); setCategory(null); setDifficulty(null) }}><RefreshCw className="mr-2 h-4 w-4" />Clear Filters</Button>
              : <Link href="/learn"><Button variant="outline"><BookOpen className="mr-2 h-4 w-4" />Explore Learning Paths</Button></Link>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                isFavorited={favorites.has(prompt.id)}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Filter, FileText, BookOpen, RefreshCw, Sparkles, Wand2, X, Copy, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/empty-state"
import { PromptCard } from "@/components/prompts/prompt-card"
import { useToast } from "@/components/toast"
import { cn } from "@/lib/utils"

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
  const [showGenerator, setShowGenerator] = useState(false)
  const [genDescription, setGenDescription] = useState("")
  const [genCategory, setGenCategory] = useState("")
  const [genDifficulty, setGenDifficulty] = useState("")
  const [genTool, setGenTool] = useState("")
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState<{ content: string; suggestedTitle: string } | null>(null)
  const [copied, setCopied] = useState(false)
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
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Prompt Library</h1>
            <p className="mt-2 text-muted-foreground">
              Browse curated prompts or generate custom ones with AI
            </p>
          </div>
          <Button onClick={() => { setShowGenerator(true); setGenerated(null); setGenDescription("") }} className="shrink-0 gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Prompt
          </Button>
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

        {/* AI Prompt Generator */}
        {showGenerator && (
          <Card className="mb-8 border-primary/20 bg-primary/[0.03]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold">AI Prompt Generator</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowGenerator(false)} aria-label="Close">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {!generated ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Describe what kind of prompt you need</label>
                    <textarea
                      value={genDescription}
                      onChange={(e) => setGenDescription(e.target.value)}
                      placeholder="e.g., A prompt for generating professional product photography with Midjourney, or a coding prompt for React component generation..."
                      className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Category (optional)</label>
                      <select value={genCategory} onChange={(e) => setGenCategory(e.target.value)} className="w-full h-9 rounded-lg border border-input bg-background px-2 text-sm">
                        <option value="">Any category</option>
                        <option value="writing">Writing</option>
                        <option value="coding">Coding</option>
                        <option value="creative">Creative</option>
                        <option value="business">Business</option>
                        <option value="analysis">Analysis</option>
                        <option value="education">Education</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Difficulty</label>
                      <select value={genDifficulty} onChange={(e) => setGenDifficulty(e.target.value)} className="w-full h-9 rounded-lg border border-input bg-background px-2 text-sm">
                        <option value="">Any difficulty</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">For AI tool (optional)</label>
                      <select value={genTool} onChange={(e) => setGenTool(e.target.value)} className="w-full h-9 rounded-lg border border-input bg-background px-2 text-sm">
                        <option value="">Any tool</option>
                        {[...new Set(prompts.map((p) => p.tool.slug))].map((slug) => {
                          const t = prompts.find((p) => p.tool.slug === slug)?.tool
                          return t ? <option key={slug} value={slug}>{t.name}</option> : null
                        })}
                      </select>
                    </div>
                  </div>
                  <Button
                    onClick={async () => {
                      if (!genDescription.trim()) return
                      setGenerating(true)
                      try {
                        const res = await fetch("/api/prompts/generate", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            description: genDescription,
                            toolSlug: genTool || undefined,
                            category: genCategory || undefined,
                            difficulty: genDifficulty || undefined,
                          }),
                        })
                        const data = await res.json()
                        if (data?.data) {
                          setGenerated(data.data)
                        } else {
                          showToast(data.error || "Failed to generate", "error")
                        }
                      } catch {
                        showToast("Failed to generate prompt", "error")
                      }
                      setGenerating(false)
                    }}
                    disabled={!genDescription.trim() || generating}
                    className="gap-2"
                  >
                    {generating ? (
                      <><RefreshCw className="h-4 w-4 animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles className="h-4 w-4" /> Generate Prompt</>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Generated Prompt</p>
                      <p className="text-lg font-semibold mt-1">{generated.suggestedTitle}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline" size="sm" className="gap-1.5"
                        onClick={async () => {
                          try {
                            const res = await fetch("/api/prompts", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                title: generated.suggestedTitle,
                                content: generated.content,
                                description: genDescription.slice(0, 200),
                                category: genCategory || undefined,
                                difficulty: genDifficulty || "beginner",
                                toolSlug: genTool || undefined,
                              }),
                            })
                            if (res.ok) {
                              showToast("Prompt saved to library", "success")
                              setShowGenerator(false)
                              // Refresh prompts list
                              const params = new URLSearchParams()
                              if (search) params.set("search", search)
                              const refresh = await fetch(`/api/prompts?${params.toString()}`)
                              if (refresh.ok) setPrompts((await refresh.json()).items)
                            } else {
                              showToast("Failed to save", "error")
                            }
                          } catch {
                            showToast("Failed to save prompt", "error")
                          }
                        }}
                      >
                        <FileText className="h-4 w-4" /> Save
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { navigator.clipboard.writeText(generated.content); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>
                        {copied ? <><Check className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy</>}
                      </Button>
                    </div>
                  </div>
                  <div className="relative rounded-lg border bg-secondary/30 p-4">
                    <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                      {generated.content}
                    </pre>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setGenerated(null)} className="gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5" /> Generate another
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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

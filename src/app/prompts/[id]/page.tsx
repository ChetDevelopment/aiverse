"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Copy, Heart, Star, ArrowLeft, Sparkles, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { useToast } from "@/components/toast"
import { cn, formatRating } from "@/lib/utils"

interface Prompt {
  id: string
  title: string
  content: string
  description: string | null
  category: string | null
  difficulty: string
  isOfficial: boolean
  language: string
  avgRating: number
  ratingCount: number
  useCount: number
  createdAt: string
  tool: { id: string; name: string; slug: string; logo: string | null }
  user: { id: string; name: string | null; avatarUrl: string | null } | null
  _count: { favorites: number }
}

const difficultyColors: Record<string, string> = {
  beginner: "success",
  intermediate: "warning",
  advanced: "destructive",
}

export default function PromptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [similar, setSimilar] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [favorited, setFavorited] = useState(false)
  const [ratingLoading, setRatingLoading] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/prompts/${id}`)
        if (res.ok) {
          const data = await res.json()
          setPrompt(data)

          const similarRes = await fetch(`/api/prompts?toolId=${data.tool.id}&limit=4`)
          if (similarRes.ok) {
            const similarData = await similarRes.json()
            setSimilar(similarData.items.filter((p: Prompt) => p.id !== id).slice(0, 3))
          }
        }
      } catch {
        showToast("Failed to load prompt", "error")
      }
      setLoading(false)
    }
    load()
  }, [id, showToast])

  async function copyContent() {
    if (!prompt) return
    try {
      await navigator.clipboard.writeText(prompt.content)
      showToast("Copied to clipboard", "success")
    } catch {
      showToast("Failed to copy", "error")
    }
  }

  async function handleRating(rating: number) {
    if (!prompt || ratingLoading) return
    setRatingLoading(true)
    try {
      const res = await fetch(`/api/prompts/${prompt.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      })
      if (res.ok) {
        const updated = await res.json()
        setPrompt((prev) => prev ? { ...prev, avgRating: updated.avgRating, ratingCount: updated.ratingCount } : null)
        setUserRating(rating)
        showToast("Rating saved", "success")
      }
    } catch {
      showToast("Failed to rate", "error")
    }
    setRatingLoading(false)
  }

  async function handleFavorite() {
    if (!prompt) return
    try {
      const res = await fetch(`/api/prompts/${prompt.id}/favorite`, { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        setFavorited(data.favorited)
        showToast(data.favorited ? "Saved" : "Unsaved", "success")
      }
    } catch {
      showToast("Failed to update", "error")
    }
  }

  async function handleUse() {
    if (!prompt) return
    try {
      await fetch(`/api/prompts/${prompt.id}/use`, { method: "POST" })
      setPrompt((prev) => prev ? { ...prev, useCount: prev.useCount + 1 } : null)
    } catch (error) {
      console.error("[PROMPT_DETAIL] Failed to record use", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (!prompt) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <EmptyState
            icon={AlertTriangle}
            title="Prompt not found"
            description="This prompt doesn't exist or has been removed."
            action={<Link href="/prompts"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Back to prompts</Button></Link>}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/prompts"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to prompts
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border bg-secondary text-lg font-bold text-primary overflow-hidden">
                  {prompt.tool.logo ? (
                    <img src={prompt.tool.logo} alt={prompt.tool.name} className="h-full w-full object-contain p-1" />
                  ) : (
                    prompt.tool.name.charAt(0)
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold">{prompt.title}</h1>
                    {prompt.isOfficial && (
                      <Sparkles className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Link
                      href={`/ai-tool/${prompt.tool.slug}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {prompt.tool.name}
                    </Link>
                    {prompt.category && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {prompt.category}
                      </Badge>
                    )}
                    <Badge
                      variant={(difficultyColors[prompt.difficulty] || "secondary") as "success" | "warning" | "destructive" | "secondary"}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {prompt.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {prompt.content}
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-0 right-0"
                    onClick={copyContent}
                  >
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>

            {prompt.description && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground">{prompt.description}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    {Array.from({ length: 5 }, (_, i) => {
                      const star = i + 1
                      const filled = star <= Math.round(hoverRating || userRating || prompt.avgRating)
                      return (
                        <button
                          key={star}
                          type="button"
                          disabled={ratingLoading}
                          className="transition-transform hover:scale-110"
                          onClick={() => handleRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                        >
                          <Star
                            className={cn(
                              "h-5 w-5",
                              filled
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                            )}
                          />
                        </button>
                      )
                    })}
                    <span className="ml-1 text-sm font-medium">
                      {prompt.ratingCount > 0 ? formatRating(prompt.avgRating) : "—"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {prompt.ratingCount} rating{prompt.ratingCount !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Uses</span>
                  <span className="font-medium">{prompt.useCount}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Favorites</span>
                  <span className="font-medium">{prompt._count.favorites}</span>
                </div>

                <div className="space-y-2">
                  <Button className="w-full" onClick={copyContent}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Prompt
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleFavorite}
                  >
                    <Heart
                      className={cn(
                        "mr-2 h-4 w-4",
                        favorited && "fill-red-500 text-red-500"
                      )}
                    />
                    {favorited ? "Saved" : "Save"}
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleUse}
                  >
                    Mark as Used
                  </Button>
                </div>

                <Link
                  href={`/ai-tool/${prompt.tool.slug}`}
                  className="block"
                >
                  <Button variant="link" className="w-full">
                    View {prompt.tool.name} →
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold mb-3">Similar Prompts</h3>
                {similar.length > 0 ? (
                  <div className="space-y-2">
                    {similar.map((p) => (
                      <Link
                        key={p.id}
                        href={`/prompts/${p.id}`}
                        className="block rounded-lg p-2.5 hover:bg-accent transition-colors -mx-2.5"
                      >
                        <p className="text-sm font-medium leading-snug line-clamp-2">
                          {p.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Star className="h-3 w-3" />
                            {p.ratingCount > 0 ? formatRating(p.avgRating) : "—"}
                          </span>
                          <span>{p.useCount} uses</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Star}
                    title="No similar prompts"
                    description="No similar prompts for this tool yet. Browse all prompts to discover more."
                    action={<Link href="/prompts"><Button variant="link" size="sm">Browse all prompts</Button></Link>}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

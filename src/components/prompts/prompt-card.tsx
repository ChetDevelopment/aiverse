"use client"

import Link from "next/link"
import { Copy, Heart, Star, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn, formatRating } from "@/lib/utils"
import { useToast } from "@/components/toast"

interface PromptCardPrompt {
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

interface PromptCardProps {
  prompt: PromptCardPrompt
  isFavorited?: boolean
  onFavoriteToggle?: (id: string) => void
}

const difficultyColors: Record<string, string> = {
  beginner: "success",
  intermediate: "warning",
  advanced: "destructive",
}

export function PromptCard({ prompt, isFavorited, onFavoriteToggle }: PromptCardProps) {
  const { showToast } = useToast()

  async function copyContent() {
    try {
      await navigator.clipboard.writeText(prompt.content)
      showToast("Copied to clipboard", "success")
    } catch {
      showToast("Failed to copy", "error")
    }
  }

  async function handleFavorite(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (onFavoriteToggle) {
      onFavoriteToggle(prompt.id)
    }
  }

  return (
    <Link href={`/prompts/${prompt.id}`}>
      <Card className="group h-full hover:border-primary/30 transition-all duration-200 hover:shadow-md cursor-pointer">
        <CardContent className="p-5 flex flex-col h-full">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-secondary text-xs font-bold text-primary overflow-hidden">
                {prompt.tool.logo ? (
                  <img src={prompt.tool.logo} alt={prompt.tool.name} className="h-full w-full object-contain p-0.5" />
                ) : (
                  prompt.tool.name.charAt(0)
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground truncate">
                  {prompt.tool.name}
                </p>
                <h3 className="text-sm font-semibold leading-tight truncate">
                  {prompt.title}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {prompt.isOfficial && (
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleFavorite}
                aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart
                  className={cn(
                    "h-3.5 w-3.5",
                    isFavorited && "fill-red-500 text-red-500"
                  )}
                />
              </Button>
            </div>
          </div>

          {prompt.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
              {prompt.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-1.5 mb-3">
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

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {prompt.ratingCount > 0 ? formatRating(prompt.avgRating) : "—"}
              </span>
              <span>{prompt.useCount} uses</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                copyContent()
              }}
              aria-label="Copy prompt"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

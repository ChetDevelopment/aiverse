"use client"

import { useState } from "react"
import { Heart, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/toast"
import { cn } from "@/lib/utils"

export function ToolActions({ toolId }: { toolId: string }) {
  const [favorited, setFavorited] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [loadingFav, setLoadingFav] = useState(false)
  const [loadingBm, setLoadingBm] = useState(false)
  const { showToast } = useToast()

  async function toggleFavorite() {
    setLoadingFav(true)
    try {
      const method = favorited ? "DELETE" : "POST"
      const res = await fetch("/api/favorites", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId }),
      })
      if (res.ok) {
        setFavorited(!favorited)
        showToast(favorited ? "Removed from favorites" : "Added to favorites", "success")
      }
    } catch { showToast("Failed to update", "error") }
    setLoadingFav(false)
  }

  async function toggleBookmark() {
    setLoadingBm(true)
    try {
      const method = bookmarked ? "DELETE" : "POST"
      const res = await fetch("/api/bookmarks", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId }),
      })
      if (res.ok) {
        setBookmarked(!bookmarked)
        showToast(bookmarked ? "Removed bookmark" : "Bookmarked", "success")
      }
    } catch { showToast("Failed to update", "error") }
    setLoadingBm(false)
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="lg" onClick={toggleFavorite} disabled={loadingFav}>
        <Heart className={cn("mr-2 h-4 w-4", favorited && "fill-red-500 text-red-500")} />
        {favorited ? "Saved" : "Save"}
      </Button>
      <Button variant="outline" size="lg" onClick={toggleBookmark} disabled={loadingBm}>
        <Bookmark className={cn("mr-2 h-4 w-4", bookmarked && "fill-primary text-primary")} />
        {bookmarked ? "Bookmarked" : "Bookmark"}
      </Button>
    </div>
  )
}

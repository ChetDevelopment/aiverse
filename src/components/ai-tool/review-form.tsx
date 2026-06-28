"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/toast"
import { cn } from "@/lib/utils"

interface ReviewFormProps {
  toolId: string
}

export function ReviewForm({ toolId }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    fetch("/api/auth/user")
      .then((r) => r.json())
      .then((data) => setIsAuthenticated(!!data.user))
      .catch(() => setIsAuthenticated(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) {
      showToast("Please select a rating", "error")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId, rating, comment: comment || undefined }),
      })
      if (res.ok) {
        showToast("Review submitted!", "success")
        setRating(0)
        setComment("")
      } else {
        const data = await res.json()
        showToast(data.error || "Failed to submit", "error")
      }
    } catch {
      showToast("Failed to submit review", "error")
    }
    setLoading(false)
  }

  if (isAuthenticated === false) {
    return (
      <div className="rounded-xl border p-5 text-center">
        <p className="text-sm text-muted-foreground mb-3">Sign in to leave a review</p>
        <Link href="/login"><Button variant="outline" size="sm">Sign In</Button></Link>
      </div>
    )
  }

  if (isAuthenticated === null) return null

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border p-5 space-y-4">
      <h3 className="font-semibold">Write a Review</h3>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
            className="p-0.5 transition-colors"
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                (hoverRating || rating) >= star
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30"
              )}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
        )}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience with this tool (optional)"
        rows={3}
        className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />

      <Button type="submit" size="sm" disabled={loading || rating === 0}>
        {loading ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  )
}

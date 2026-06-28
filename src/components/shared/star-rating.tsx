import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  size?: "sm" | "lg"
  showNumeric?: boolean
}

export function StarRating({ rating, size = "sm", showNumeric = false }: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(rating))
  return (
    <div className="flex items-center gap-1" role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {stars.map((filled, i) => (
        <Star
          key={i}
          className={cn(
            size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5",
            filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
          )}
        />
      ))}
      {showNumeric && rating > 0 && (
        <span className="text-sm font-medium ml-1">{rating.toFixed(1)}</span>
      )}
    </div>
  )
}

"use client"

import { BarChart3, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CompareButtonProps {
  slug: string
  isInCompare: boolean
  onToggle: (slug: string) => void
}

export function CompareButton({ slug, isInCompare, onToggle }: CompareButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onToggle(slug)
      }}
      className={cn(
        "text-xs h-8 px-2",
        isInCompare && "text-primary"
      )}
      aria-label={isInCompare ? `Remove ${slug} from comparison` : `Add ${slug} to comparison`}
    >
      {isInCompare ? (
        <Check className="mr-1 h-3 w-3" />
      ) : (
        <BarChart3 className="mr-1 h-3 w-3" />
      )}
      {isInCompare ? "Added" : "Compare"}
    </Button>
  )
}

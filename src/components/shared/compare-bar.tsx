"use client"

import { BarChart3, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface CompareBarProps {
  slugs: string[]
  onRemove: (slug: string) => void
  onClear: () => void
  onCompare: () => void
}

export function CompareBar({ slugs, onRemove, onClear, onCompare }: CompareBarProps) {
  if (slugs.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 bottom-14 lg:bottom-0">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">{slugs.length} tool{slugs.length !== 1 ? "s" : ""} selected</span>
          <div className="ml-2 flex gap-1">
            {slugs.map((slug) => (
              <Badge key={slug} variant="secondary" className="gap-1">
                {slug}
                <button onClick={() => onRemove(slug)} className="hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear
          </Button>
          <Button size="sm" onClick={onCompare} disabled={slugs.length < 2}>
            Compare
          </Button>
        </div>
      </div>
    </div>
  )
}

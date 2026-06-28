"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Clock } from "lucide-react"
import { Card } from "@/components/ui/card"

interface HistoryItem {
  id: string
  tool: { id: string; name: string; slug: string; tagline: string }
}

export function RecentlyViewed() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/history")
      .then((r) => {
        if (r.status === 401) { setLoading(false); return null }
        return r.json()
      })
      .then((data) => {
        if (Array.isArray(data)) setItems(data.slice(0, 6))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return null
  if (items.length === 0) return null

  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Recently Viewed</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
          {items.map((item) => (
            <Link key={item.id} href={`/ai-tool/${item.tool.slug}`} className="snap-start shrink-0">
              <Card className="w-48 p-3 hover:border-primary/30 transition-colors">
                <p className="font-medium text-sm truncate">{item.tool.name}</p>
                <p className="text-xs text-muted-foreground truncate mt-1">{item.tool.tagline}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

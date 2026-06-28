"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Bookmark, Heart, Clock, ArrowLeft } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

type Tab = "favorites" | "bookmarks" | "history"

interface Item {
  id: string; createdAt: string
  tool: { id: string; name: string; slug: string; tagline: string; pricing: string }
}

function SavedContent() {
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get("tab") as Tab) || "favorites"
  const [tab, setTab] = useState<Tab>(initialTab)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/${tab}`)
        const data = await res.json()
        if (!cancelled) {
          if (Array.isArray(data)) setItems(data)
          else setItems([])
        }
      } catch {
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [tab])

  const tabs: { key: Tab; label: string; icon: typeof Heart }[] = [
    { key: "favorites", label: "Favorites", icon: Heart },
    { key: "bookmarks", label: "Bookmarks", icon: Bookmark },
    { key: "history", label: "History", icon: Clock },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="text-3xl font-bold mb-6">Your Saved Tools</h1>

        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <Button key={t.key} variant={tab === t.key ? "default" : "outline"} size="sm" onClick={() => setTab(t.key)}>
              <t.icon className="mr-2 h-4 w-4" />{t.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Nothing saved yet"
            description="Start browsing AI tools and save your favorites, bookmarks, and history will appear here."
            action={<Link href="/search"><Button>Browse AI Tools</Button></Link>}
          />
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <Link key={item.id} href={`/ai-tool/${item.tool.slug}`}>
                <Card className="p-4 hover:border-primary/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.tool.name}</p>
                      <p className="text-sm text-muted-foreground">{item.tool.tagline}</p>
                    </div>
                    <Badge variant={item.tool.pricing === "FREE" ? "success" : "secondary"}>{item.tool.pricing}</Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SavedPage() {
  return (
    <Suspense fallback={null}>
      <SavedContent />
    </Suspense>
  )
}

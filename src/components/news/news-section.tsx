"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { RefreshCw, Clock, Newspaper, MessageCircle, TrendingUp, ArrowRight, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface NewsItem {
  id: number; title: string; url: string; points: number
  author: string; timeAgo: string; source: string
  thumbnail: string; commentCount: number
}

const TOPICS = [
  { id: "all", label: "All Tech" },
  { id: "AI", label: "AI" },
  { id: "Dev", label: "Dev" },
  { id: "Hardware", label: "Hardware" },
  { id: "Security", label: "Security" },
]

export function NewsSection({ limit, showViewAll = false }: { limit?: number; showViewAll?: boolean }) {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTopic, setActiveTopic] = useState("all")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState(900)
  const [brokenImages, setBrokenImages] = useState<Set<number>>(new Set())

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/news?topic=${activeTopic}`)
        const data = await res.json()
        if (!cancelled && data?.items) setItems(data.items)
      } catch {}
      if (!cancelled) { setLoading(false); setLastUpdated(new Date()) }
    }
    load()
    return () => { cancelled = true }
  }, [activeTopic])

  const refreshNews = useCallback(async () => {
    setCountdown(900); setLoading(true)
    try {
      const res = await fetch(`/api/news?topic=${activeTopic}&refresh=true`)
      const data = await res.json()
      if (data?.items) setItems(data.items)
    } catch {}
    setLoading(false); setLastUpdated(new Date())
  }, [activeTopic])

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.hidden) return
      setCountdown((prev) => {
        if (prev <= 1) { refreshNews(); return 900 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [refreshNews])

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`
  const displayItems = limit ? items.slice(0, limit) : items

  return (
    <section id="news" className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Newspaper className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Latest Tech News</h2>
              <p className="text-sm text-muted-foreground">Live from Hacker News</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{lastUpdated.toLocaleTimeString()}</span>
                <span className="font-mono text-[10px] text-muted-foreground/50">· {fmt(countdown)}</span>
              </span>
            )}
            <Button variant="outline" size="sm" onClick={refreshNews} disabled={loading} className="h-8 gap-1.5">
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            {showViewAll && (
              <Link href="/news">
                <Button variant="ghost" size="sm" className="h-8 gap-1.5">
                  View All <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="flex gap-1.5 mb-6 overflow-x-auto scrollbar-hide pb-1">
          {TOPICS.map((t) => (
            <button key={t.id} onClick={() => setActiveTopic(t.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                activeTopic === t.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              )}
            >{t.label}</button>
          ))}
        </div>

        {loading && items.length === 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: limit || 9 }).map((_, i) => (
              <Card key={i} className="overflow-hidden"><CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2"><Skeleton className="h-3.5 w-full" /><Skeleton className="h-3 w-3/4" /></div>
                </div>
                <Skeleton className="h-3.5 w-full mb-2" />
                <Skeleton className="h-3.5 w-5/6 mb-3" />
                <Skeleton className="h-3 w-1/3" />
              </CardContent></Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-muted-foreground">
            <Newspaper className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p>No news articles found.</p>
          </CardContent></Card>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {displayItems.map((item) => (
                <Link key={item.id} href={`/news/${item.id}`} className="group">
                  <Card className="h-full hover:shadow-md hover:border-primary/20 transition-all duration-200 overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-secondary overflow-hidden">
                          {brokenImages.has(item.id) ? (
                            <Newspaper className="h-4 w-4 text-muted-foreground/50" />
                          ) : (
                            <Image src={item.thumbnail} alt="" width={32} height={32} className="h-full w-full object-contain p-0.5" onError={() => setBrokenImages((prev) => new Set(prev).add(item.id))} />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                          <Badge variant="secondary" className="text-[10px] shrink-0">{item.source}</Badge>
                          {item.points > 80 && (
                            <Badge variant="default" className="text-[9px] h-4 shrink-0 bg-orange-500/15 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20">
                              Trending
                            </Badge>
                          )}
                        </div>
                      </div>

                      <h3 className="text-sm font-medium leading-snug line-clamp-3 group-hover:text-primary transition-colors mb-3">
                        {item.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1.5 border-t">
                        <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />{item.points}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{item.commentCount}</span>
                        <span className="flex items-center gap-1 ml-auto"><Clock className="h-3 w-3" />{item.timeAgo}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}

        <p className="text-center text-[10px] text-muted-foreground/40 mt-4">
          Sourced from Hacker News · Auto-refreshes every 15 minutes
        </p>
      </div>
    </section>
  )
}

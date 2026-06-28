"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Star, GitFork, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function TrendingClient() {
  const [data, setData] = useState<Record<string, unknown[]> | null>(null)

  useEffect(() => {
    fetch("/api/github/trending").then((r) => r.json()).then(setData).catch((error: unknown) => {
      console.error("[TRENDING] Failed to load trending data", error)
    })
  }, [])

  if (!data) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Trending AI Projects</h1>
          </div>
          <div className="space-y-8">
            {Array.from({ length: 5 }).map((_, ci) => (
              <div key={ci}>
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const categories = Object.entries(data)

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Trending AI Projects</h1>
        </div>
        <p className="text-muted-foreground mb-8">Trending open-source projects from GitHub across 15 categories.</p>

        <div className="space-y-10">
          {categories.map(([cat, repos]) => (
            <section key={cat}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{cat}</h2>
                <span className="text-xs text-muted-foreground">{repos.length} projects</span>
              </div>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {(repos as Record<string, unknown>[]).slice(0, 10).map((repo) => (
                  <Link key={repo.full_name as string} href={`/repo/${encodeURIComponent(repo.full_name as string)}`}>
                    <Card className="h-full hover:shadow-md hover:border-primary/20 transition-all duration-200">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border bg-secondary overflow-hidden">
                            {(repo.owner as Record<string, unknown>)?.avatar_url
                              ? <Image src={(repo.owner as Record<string, unknown>).avatar_url as string} alt="" width={24} height={24} className="h-full w-full object-contain" unoptimized />
                              : <span className="text-[8px] font-bold">{(repo.name as string)?.charAt(0)}</span>}
                          </div>
                          <p className="text-xs font-medium truncate">{repo.name as string}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                          {repo.description as string || "No description"}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-0.5"><Star className="h-2.5 w-2.5" />{(repo.stars as number)?.toLocaleString()}</span>
                          <span className="flex items-center gap-0.5"><GitFork className="h-2.5 w-2.5" />{(repo.forks as number)?.toLocaleString()}</span>
                          {repo.language ? <span className="truncate">{String(repo.language)}</span> : null}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BookOpen, GraduationCap, Code2, Palette, Briefcase, Megaphone, CheckCircle, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { cn } from "@/lib/utils"

interface Step {
  title: string
  description?: string
  tools?: { name: string; slug: string }[]
  blogPosts?: { title: string; slug: string }[]
  prompts?: { title: string; id: string }[]
}

interface LearningPath {
  id: string
  title: string
  slug: string
  description: string | null
  icon: string | null
  difficulty: string
  category: string | null
  steps: Step[] | null
  published: boolean
  createdAt: string
}

const categoryTabs = [
  { id: "all", label: "All", icon: BookOpen },
  { id: "students", label: "AI for Students", icon: GraduationCap },
  { id: "developers", label: "Developers", icon: Code2 },
  { id: "designers", label: "Designers", icon: Palette },
  { id: "business", label: "Business", icon: Briefcase },
  { id: "marketing", label: "Marketing", icon: Megaphone },
]

const difficultyColor: Record<string, "default" | "secondary" | "success" | "warning" | "outline"> = {
  beginner: "success",
  intermediate: "warning",
  advanced: "default",
}

function getProgress(slug: string): string[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(`aiverse-learn-${slug}`)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function LearningPathCard({ path }: { path: LearningPath }) {
  const stepCount = path.steps ? path.steps.length : 0
  const completed = getProgress(path.slug)
  const progress = stepCount > 0 ? Math.round((completed.length / stepCount) * 100) : 0

  return (
    <Link href={`/learn/${path.slug}`}>
      <Card className="h-full hover:border-primary/30 hover:shadow-md transition-all duration-200">
        <CardContent className="p-5 flex flex-col h-full">
          <div className="flex items-start gap-3 mb-3">
            {path.icon ? (
              <span className="text-2xl">{path.icon}</span>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{path.title}</h3>
              {path.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {path.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-auto pt-3">
            <Badge variant={difficultyColor[path.difficulty] || "secondary"} className="capitalize">
              {path.difficulty}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {stepCount} step{stepCount !== 1 ? "s" : ""}
            </span>
          </div>

          {progress > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {completed.length}/{stepCount}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

export default function LearnPage() {
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPaths() {
      try {
        const res = await fetch("/api/learning")
        if (!res.ok) throw new Error("Failed to load")
        const data = await res.json()
        setPaths(data.paths || [])
      } catch {
        setError("Failed to load learning paths")
      }
      setLoading(false)
    }
    fetchPaths()
  }, [])

  const filtered = activeTab === "all"
    ? paths
    : paths.filter((p) => p.category === activeTab)

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Learning Center</h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Structured learning paths to master AI tools. Whether you&apos;re a student, developer, designer, or business professional, find the right path for you.
          </p>
        </div>

        <div className="flex overflow-x-auto gap-2 pb-4 mb-8 scrollbar-hide">
          {categoryTabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No learning paths yet"
            description={activeTab === "all" ? "Learning paths are being created. Check back soon for structured guides on mastering AI tools." : "No learning paths in this category yet. Try exploring a different category."}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((path) => (
              <LearningPathCard key={path.id} path={path} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

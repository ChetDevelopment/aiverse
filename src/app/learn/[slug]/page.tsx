"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, BookOpen, CheckCircle, Circle, Clock, ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { cn } from "@/lib/utils"

interface ToolRef {
  name: string
  slug: string
}

interface BlogRef {
  title: string
  slug: string
}

interface PromptRef {
  title: string
  id: string
}

interface Step {
  title: string
  description?: string
  tools?: ToolRef[]
  blogPosts?: BlogRef[]
  prompts?: PromptRef[]
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

interface RelatedPath {
  id: string
  title: string
  slug: string
  description: string | null
  icon: string | null
  difficulty: string
  category: string | null
  steps: Step[] | null
}

const difficultyColor: Record<string, "default" | "secondary" | "success" | "warning" | "outline"> = {
  beginner: "success",
  intermediate: "warning",
  advanced: "default",
}

function loadProgress(slug: string): string[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(`aiverse-learn-${slug}`)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveProgress(slug: string, completed: string[]) {
  try {
    localStorage.setItem(`aiverse-learn-${slug}`, JSON.stringify(completed))
  } catch (error) {
    console.error("[LEARN] Failed to save progress", error)
  }
}

export default function LearningPathPage() {
  const params = useParams<{ slug: string }>()
  const [path, setPath] = useState<LearningPath | null>(null)
  const [related, setRelated] = useState<RelatedPath[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<string[]>(() => params.slug ? loadProgress(params.slug) : [])
  const [expandedStep, setExpandedStep] = useState<string | null>(null)

  useEffect(() => {
    if (!params.slug) return

    async function fetchPath() {
      try {
        const res = await fetch(`/api/learning/${params.slug}`)
        if (!res.ok) throw new Error("Not found")
        const data = await res.json()
        setPath(data.path)
        setRelated(data.related || [])
      } catch {
        setError("Learning path not found")
      }
      setLoading(false)
    }
    fetchPath()
  }, [params.slug])

  function toggleStep(stepTitle: string) {
    const next = completedSteps.includes(stepTitle)
      ? completedSteps.filter((s) => s !== stepTitle)
      : [...completedSteps, stepTitle]

    setCompletedSteps(next)
    saveProgress(params.slug!, next)
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-full" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !path) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <EmptyState
            icon={BookOpen}
            title="Path not found"
            description={error || "This learning path doesn't exist or has been removed."}
            action={<Link href="/learn"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Back to Learning Center</Button></Link>}
          />
        </div>
      </div>
    )
  }

  const steps = path.steps || []
  const progress = steps.length > 0 ? Math.round((completedSteps.length / steps.length) * 100) : 0

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Learning Center
        </Link>

        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            {path.icon ? (
              <span className="text-4xl">{path.icon}</span>
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary">
                <BookOpen className="h-7 w-7 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">{path.title}</h1>
              {path.description && (
                <p className="mt-2 text-lg text-muted-foreground">{path.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <Badge variant={difficultyColor[path.difficulty] || "secondary"} className="capitalize">
                  {path.difficulty}
                </Badge>
                {path.category && (
                  <Badge variant="outline">{path.category}</Badge>
                )}
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {steps.length} step{steps.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl border bg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedSteps.length}/{steps.length} completed
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            {progress === 100 && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-2 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Congratulations! You completed this learning path.
              </p>
            )}
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border" />

          <div className="space-y-4 relative">
            {steps.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No steps yet"
                description="This learning path is still being built. Check back soon as new content is added regularly."
              />
            ) : (
              steps.map((step, index) => {
                const isCompleted = completedSteps.includes(step.title)
                const isExpanded = expandedStep === step.title

                return (
                  <div key={step.title} className="relative pl-12">
                    <button
                      onClick={() => toggleStep(step.title)}
                      className={cn(
                        "absolute left-2.5 top-5 -translate-x-1/2 transition-colors",
                        isCompleted ? "text-primary" : "text-muted-foreground hover:text-primary"
                      )}
                      aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>

                    <Card
                      className={cn(
                        "cursor-pointer transition-all duration-200",
                        isCompleted && "border-primary/30"
                      )}
                      onClick={() => setExpandedStep(isExpanded ? null : step.title)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-bold shrink-0">
                              {index + 1}
                            </span>
                            <h3 className={cn(
                              "font-medium",
                              isCompleted && "text-muted-foreground line-through"
                            )}>
                              {step.title}
                            </h3>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>

                        {isExpanded && (
                          <div className="mt-4 space-y-4 border-t pt-4">
                            {step.description && (
                              <p className="text-sm text-muted-foreground">{step.description}</p>
                            )}

                            {step.tools && step.tools.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Recommended Tools</p>
                                <div className="flex flex-wrap gap-2">
                                  {step.tools.map((tool) => (
                                    <Link key={tool.slug} href={`/ai-tool/${tool.slug}`}>
                                      <Badge variant="outline" className="hover:bg-accent cursor-pointer">
                                        {tool.name}
                                        <ExternalLink className="ml-1 h-3 w-3" />
                                      </Badge>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}

                            {step.blogPosts && step.blogPosts.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Related Articles</p>
                                <div className="space-y-1">
                                  {step.blogPosts.map((post) => (
                                    <Link
                                      key={post.slug}
                                      href={`/blog/${post.slug}`}
                                      className="block text-sm text-primary hover:underline"
                                    >
                                      {post.title}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}

                            {step.prompts && step.prompts.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Useful Prompts</p>
                                <div className="space-y-1">
                                  {step.prompts.map((prompt) => (
                                    <Link
                                      key={prompt.id}
                                      href={`/prompts/${prompt.id}`}
                                      className="block text-sm text-primary hover:underline"
                                    >
                                      {prompt.title}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Related Learning Paths</h2>
          {related.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((rp) => (
                <Link key={rp.id} href={`/learn/${rp.slug}`}>
                  <Card className="h-full hover:border-primary/30 hover:shadow-md transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                          {rp.icon ? (
                            <span className="text-2xl">{rp.icon}</span>
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                              <BookOpen className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{rp.title}</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={difficultyColor[rp.difficulty] || "secondary"} className="capitalize text-[10px] px-2 py-0">
                          {rp.difficulty}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {rp.steps ? rp.steps.length : 0} steps
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No related paths"
              description="No related learning paths found for this topic. Browse all paths to discover something new."
              action={<Link href="/learn"><Button variant="outline" size="sm"><BookOpen className="mr-2 h-4 w-4" />Browse All Paths</Button></Link>}
            />
          )}
        </div>
      </div>
    </div>
  )
}

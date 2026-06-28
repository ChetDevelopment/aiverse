"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Clock, Layers, ChevronRight, Sparkles, ArrowLeft, Heart, Share2, Check, Search, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { ShareButton } from "@/components/shared/share-button"
import { EmptyState } from "@/components/shared/empty-state"
import { useUser } from "@/hooks/use-user"

const DIFFICULTY_COLORS: Record<string, "success" | "warning" | "default"> = {
  beginner: "success",
  intermediate: "warning",
  advanced: "default",
}

export default function UseCaseDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user } = useUser()
  const [useCase, setUseCase] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [prompts, setPrompts] = React.useState<any[]>([])
  const [saved, setSaved] = React.useState(false)

  React.useEffect(() => {
    async function fetchUseCase() {
      try {
        const res = await fetch(`/api/usecases/${slug}`)
        const data = await res.json()
        setUseCase(data)
      } catch (error) {
        console.error("[USECASE_DETAIL] Failed to fetch use case", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUseCase()
  }, [slug])

  React.useEffect(() => {
    if (!useCase?.tools?.length) return
    fetch(`/api/usecases/${useCase.slug}/prompts`)
      .then((r) => r.json())
      .then((data) => setPrompts(data.prompts.slice(0, 6)))
      .catch(() => setPrompts([]))
  }, [useCase])

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-60 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!useCase) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <EmptyState
            icon={Search}
            title="Use case not found"
            description="This use case doesn't exist or has been removed."
            action={<Link href="/usecases"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Back to use cases</Button></Link>}
          />
        </div>
      </div>
    )
  }

  const steps: { title: string; description: string }[] = Array.isArray(useCase.steps) ? useCase.steps : []

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[
          { label: "Use Cases", href: "/usecases" },
          { label: useCase.title },
        ]} />

        <div className="flex items-start gap-5 mb-8">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border bg-secondary text-2xl">
            {useCase.icon || <Sparkles className="h-6 w-6" />}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight mb-2">{useCase.title}</h1>
            <p className="text-lg text-muted-foreground mb-4">{useCase.description}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={DIFFICULTY_COLORS[useCase.difficulty] || "default"}>
                {useCase.difficulty}
              </Badge>
              {useCase.estimatedTime && (
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {useCase.estimatedTime}
                </Badge>
              )}
              <Badge variant="secondary" className="gap-1">
                <Layers className="h-3.5 w-3.5" />
                {useCase.tools?.length || 0} tools
              </Badge>
              {useCase.category && (
                <Badge variant="outline">{useCase.category}</Badge>
              )}
            </div>
          </div>
        </div>

        {steps.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-6">Workflow</h2>
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-8">
                {steps.map((step, i) => (
                  <div key={i} className="relative pl-14">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-background text-sm font-bold text-primary z-10">
                      {i + 1}
                    </div>
                    <div className="rounded-xl border p-5">
                      <h3 className="font-semibold mb-1">{step.title}</h3>
                      {step.description && (
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {useCase.tools?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Recommended Tools</h2>
            <div className="grid gap-3">
              {useCase.tools.map((ut: any) => {
                const tool = ut.tool
                const avgRating = tool.reviews?.length
                  ? tool.reviews.reduce((a: number, r: any) => a + r.rating, 0) / tool.reviews.length
                  : 0
                return (
                  <Link key={ut.id} href={`/ai-tool/${tool.slug}`}>
                    <Card className="hover:shadow-md transition-all">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-secondary text-sm font-bold text-primary">
                          {tool.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{tool.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{tool.tagline}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={
                            tool.pricing === "FREE" ? "success" :
                            tool.pricing === "FREEMIUM" ? "warning" : "secondary"
                          } className="text-[10px]">
                            {tool.pricing}
                          </Badge>
                          {avgRating > 0 && (
                            <span className="text-sm text-muted-foreground">★ {avgRating.toFixed(1)}</span>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Example Prompts</h2>
          {prompts.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {prompts.map((prompt: any, i: number) => (
                <Card key={prompt.id || i}>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium mb-1">{prompt.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{prompt.description || prompt.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Sparkles}
              title="No prompts yet"
              description="Example prompts for this use case are being prepared. Check back soon, or browse the Prompt Library for inspiration."
              action={<Link href="/prompts"><Button variant="outline" size="sm"><Sparkles className="mr-2 h-4 w-4" />Browse Prompt Library</Button></Link>}
            />
          )}
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Alternative Approaches</h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                Explore different tool combinations and workflows for achieving similar results.
                Check the tools page for alternatives to each recommended tool.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {useCase.tools?.slice(0, 3).map((ut: any) => (
                  <Link key={ut.id} href={`/ai-tool/${ut.tool.slug}#alternatives`}>
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                      {ut.tool.name} alternatives
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="flex items-center gap-3 pt-6 border-t">
          <ShareButton title={useCase.title} url={`/usecases/${useCase.slug}`} />
          {user && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSaved(!saved)}
            >
              <Heart className={`mr-2 h-4 w-4 ${saved ? "fill-current text-red-500" : ""}`} />
              {saved ? "Saved" : "Save"}
            </Button>
          )}
          <Link href="/usecases" className="ml-auto">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              All Use Cases
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

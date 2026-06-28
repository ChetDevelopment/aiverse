"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  BookOpen,
  ArrowRight,
  Rocket,
  Layers,
  ChevronRight,
  Eye,
  Zap,
  GraduationCap,
  Compass,
  GitBranch,
  TrendingUp,
  BriefcaseBusiness,
  Wrench,
} from "lucide-react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SectionHeader } from "@/components/shared/section-header"
import { StarRating } from "@/components/shared/star-rating"
import { Skeleton } from "@/components/ui/skeleton"
import { useUser } from "@/hooks/use-user"
import { cn } from "@/lib/utils"
import type { ToolCardData } from "@/types"

interface PromptItem {
  id: string
  title: string
  content: string
  description?: string
  difficulty: string
  useCount: number
  tool: { name: string; slug: string }
}

interface StackItem {
  id: string
  name: string
  emoji?: string
  description?: string
  likeCount?: number
  user?: { name: string }
  _count?: { items: number }
}

interface LearningPathItem {
  slug: string
  title: string
  description?: string
  icon?: string
  difficulty: string
  category?: string
}

interface WorkspaceItem {
  id: string
  name: string
  emoji?: string
  description?: string
  archived?: boolean
}

interface HistoryItem {
  id: string
  tool: { id: string; name: string; slug: string; tagline: string; logo?: string; pricing: string }
}

interface ContinueLearningData {
  workspaces: WorkspaceItem[]
  stacks: StackItem[]
  learningPaths: LearningPathItem[]
}

interface HomeData {
  trendingTools: ToolCardData[]
  prompts: PromptItem[]
  learningPaths: LearningPathItem[]
  stacks: StackItem[]
  userContext: {
    categoryInterests: string[]
    recentToolIds: string[]
    favoriteCount: number
    workspaceCount: number
    stackCount: number
  } | null
}

function SectionLoading({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-5">
          <div className="flex items-start gap-4">
            <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

function DashboardShellSkeleton() {
  return (
    <div className="space-y-12 py-8">
      {[1, 2, 3, 4].map((section) => (
        <div key={section} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <SectionLoading count={3} />
        </div>
      ))}
    </div>
  )
}

function RecommendedToolCard({ tool, index = 0 }: { tool: ToolCardData; index?: number }) {
  const avgRating =
    tool.reviews.length > 0
      ? tool.reviews.reduce((acc, r) => acc + r.rating, 0) / tool.reviews.length
      : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/ai-tool/${tool.slug}`}>
        <Card className="group relative h-full p-5 hover:shadow-md hover:border-primary/20 transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-secondary text-lg font-bold text-primary overflow-hidden">
              {tool.logo ? (
                <Image src={tool.logo} alt={tool.name} width={48} height={48} className="h-full w-full object-contain p-1" />
              ) : (
                tool.name.charAt(0)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                {tool.name}
              </h3>
              <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                {tool.tagline}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge
                  variant={tool.pricing === "FREE" ? "success" : tool.pricing === "FREEMIUM" ? "warning" : "default"}
                  className="text-[10px]"
                >
                  {tool.pricing === "FREE" ? "Free" : tool.pricing === "FREEMIUM" ? "Freemium" : tool.pricing === "PAID" ? "Paid" : "Contact"}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <StarRating rating={avgRating} />
                  {avgRating > 0 && <span className="font-medium">{avgRating.toFixed(1)}</span>}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  {tool.viewCount}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}

function GuestCTA() {
  const ctas = [
    {
      icon: Compass,
      title: "Explore AI Tools",
      description: "Browse thousands of AI tools for every task imaginable",
      href: "/search",
      color: "from-blue-500/10 to-purple-500/10 border-blue-500/20",
    },
    {
      icon: GraduationCap,
      title: "Start Learning",
      description: "Follow curated learning paths and master AI tools",
      href: "/learn",
      color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20",
    },
    {
      icon: GitBranch,
      title: "Build Workspaces",
      description: "Organize your AI tools into workspaces and stacks",
      href: "/workspaces",
      color: "from-orange-500/10 to-amber-500/10 border-orange-500/20",
    },
    {
      icon: TrendingUp,
      title: "Trading Hub",
      description: "Track AI market trends and discover opportunities",
      href: "/trading",
      color: "from-rose-500/10 to-pink-500/10 border-rose-500/20",
    },
  ]

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Get Started with AIVerse</h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Your hub for discovering, learning, and building with AI tools
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ctas.map((cta) => (
            <Link key={cta.href} href={cta.href}>
              <Card className={cn(
                "group relative overflow-hidden p-6 border-2 hover:shadow-lg transition-all duration-300",
                cta.color
              )}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 mb-4">
                  <cta.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{cta.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{cta.description}</p>
                <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Get started <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function ContinueLearningSection({
  workspaces,
  stacks,
  learningPaths,
}: ContinueLearningData) {
  const hasContent = workspaces.length > 0 || stacks.length > 0 || learningPaths.length > 0

  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Continue Learning" description="Pick up where you left off" />
        {hasContent ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.slice(0, 2).map((ws) => (
              <Link key={ws.id} href="/workspaces">
                <Card className="p-4 hover:border-primary/30 transition-colors h-full">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      {ws.emoji ? <span className="text-lg">{ws.emoji}</span> : <BriefcaseBusiness className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{ws.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{ws.description || "Workspace"}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </Card>
              </Link>
            ))}
            {stacks.slice(0, 2).map((st) => (
              <Link key={st.id} href="/stacks">
                <Card className="p-4 hover:border-primary/30 transition-colors h-full">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      {st.emoji ? <span className="text-lg">{st.emoji}</span> : <Wrench className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{st.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{st.description || "AI Stack"}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </Card>
              </Link>
            ))}
            {learningPaths.slice(0, 2).map((lp) => (
              <Link key={lp.slug} href={`/learn/${lp.slug}`}>
                <Card className="p-4 hover:border-primary/30 transition-colors h-full">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{lp.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{lp.difficulty}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Rocket className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">You haven&apos;t started anything yet</p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <Link href="/workspaces">
                <Button variant="outline" size="sm">Create Workspace</Button>
              </Link>
              <Link href="/learn">
                <Button variant="outline" size="sm">Explore Learning</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </section>
  )
}

function RecommendedSection({ tools }: { tools: ToolCardData[] }) {
  if (tools.length === 0) return null

  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Recommended for You" description="Based on your interests" href="/search" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, i) => (
            <RecommendedToolCard key={tool.id} tool={tool} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PromptsSection({ prompts }: { prompts: PromptItem[] }) {
  if (prompts.length === 0) return null

  return (
    <section className="py-8 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Popular Prompts" description="Most used prompts by the community" href="/prompts" />
        <div className="grid gap-4 sm:grid-cols-2">
          {prompts.map((prompt, i) => (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link href={`/prompts/${prompt.id}`}>
                <Card className="p-4 hover:border-primary/30 transition-all duration-300 h-full">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{prompt.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {prompt.description || prompt.content.slice(0, 120)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px]">{prompt.difficulty}</Badge>
                        <span className="text-[10px] text-muted-foreground">{prompt.tool.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Zap className="h-3 w-3" />
                      {prompt.useCount}
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StacksSection({ stacks }: { stacks: StackItem[] }) {
  if (stacks.length === 0) return null

  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Trending Stacks" description="Popular AI tool combinations" href="/stacks" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stacks.map((stack, i) => (
            <motion.div
              key={stack.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link href={`/stacks/${stack.id}`}>
                <Card className="p-4 hover:border-primary/30 transition-all duration-300 h-full">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      {stack.emoji ? <span className="text-lg">{stack.emoji}</span> : <Wrench className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{stack.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {stack.description || `${stack._count?.items || 0} tools`}
                      </p>
                      {stack.user?.name && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">by {stack.user.name}</p>
                      )}
                    </div>
                    {stack.likeCount != null && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Layers className="h-3 w-3" />
                        {stack.likeCount}
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function LearningPathsSection({ paths }: { paths: LearningPathItem[] }) {
  if (paths.length === 0) return null

  const difficultyColors: Record<string, string> = {
    beginner: "text-emerald-500 bg-emerald-500/10",
    intermediate: "text-amber-500 bg-amber-500/10",
    advanced: "text-rose-500 bg-rose-500/10",
  }

  return (
    <section className="py-8 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Learning Paths" description="Structured courses to master AI tools" href="/learn" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paths.map((path, i) => (
            <motion.div
              key={path.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link href={`/learn/${path.slug}`}>
                <Card className="p-5 hover:border-primary/30 transition-all duration-300 h-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-3">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{path.title}</h3>
                  {path.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{path.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <span className={cn(
                      "text-[10px] font-medium px-2 py-0.5 rounded-full capitalize",
                      difficultyColors[path.difficulty] || difficultyColors.beginner
                    )}>
                      {path.difficulty}
                    </span>
                    {path.category && (
                      <span className="text-[10px] text-muted-foreground">{path.category}</span>
                    )}
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function RecentlyViewedSection({ items }: { items: HistoryItem[] }) {
  if (items.length === 0) return null

  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Recently Viewed" description="Your recent activity" />
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
          {items.map((item) => (
            <Link key={item.id} href={`/ai-tool/${item.tool.slug}`} className="snap-start shrink-0">
              <Card className="w-48 p-3 hover:border-primary/30 transition-colors">
                <p className="font-medium text-sm truncate">{item.tool.name}</p>
                <p className="text-xs text-muted-foreground truncate mt-1">{item.tool.tagline}</p>
                <Badge variant="outline" className="text-[10px] mt-2">
                  {item.tool.pricing === "FREE" ? "Free" : item.tool.pricing === "FREEMIUM" ? "Freemium" : "Paid"}
                </Badge>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function PersonalizedDashboard() {
  const { user, loading: authLoading } = useUser()
  const [homeData, setHomeData] = React.useState<HomeData | null>(null)
  const [continueData, setContinueData] = React.useState<ContinueLearningData | null>(null)
  const [history, setHistory] = React.useState<HistoryItem[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        const [homeRes, contRes, histRes] = await Promise.all([
          fetch("/api/recommendations?type=home"),
          fetch("/api/recommendations?type=continue-learning"),
          fetch("/api/history"),
        ])

        const [homeJson, contRaw, histJson] = await Promise.all([
          homeRes.json(),
          contRes.json().catch(() => ({ workspaces: [], stacks: [], learningPaths: [] })),
          histRes.json().catch(() => []),
        ])

        const contJson = Array.isArray(contRaw)
          ? { workspaces: [], stacks: [], learningPaths: [] }
          : contRaw

        setHomeData(homeJson)
        setContinueData(contJson)
        setHistory(Array.isArray(histJson) ? histJson.slice(0, 6) : [])
      } catch {
        setHomeData(null)
        setContinueData({ workspaces: [], stacks: [], learningPaths: [] })
        setHistory([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (authLoading || loading) return <DashboardShellSkeleton />

  const isLoggedIn = !!user

  if (!isLoggedIn) {
    return (
      <>
        <GuestCTA />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <hr className="border-border/50" />
        </div>
        {homeData?.trendingTools && <RecommendedSection tools={homeData.trendingTools} />}
        {homeData?.prompts && <PromptsSection prompts={homeData.prompts} />}
        {homeData?.stacks && <StacksSection stacks={homeData.stacks} />}
        {homeData?.learningPaths && <LearningPathsSection paths={homeData.learningPaths} />}
      </>
    )
  }

  return (
    <>
      <ContinueLearningSection
        workspaces={continueData?.workspaces || []}
        stacks={continueData?.stacks || []}
        learningPaths={continueData?.learningPaths || homeData?.learningPaths || []}
      />
      {history.length > 0 && <RecentlyViewedSection items={history} />}
      {homeData?.trendingTools && <RecommendedSection tools={homeData.trendingTools} />}
      {homeData?.prompts && <PromptsSection prompts={homeData.prompts} />}
      {homeData?.stacks && <StacksSection stacks={homeData.stacks} />}
      {homeData?.learningPaths && <LearningPathsSection paths={homeData.learningPaths} />}
    </>
  )
}

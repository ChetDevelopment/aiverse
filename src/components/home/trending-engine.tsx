import { prisma } from "@/lib/prisma"
import { ToolCard } from "./tool-card"
import { SectionHeader } from "@/components/shared/section-header"
import { safeQuery } from "@/lib/utils"
import type { ToolCardData } from "@/types"

async function fetchTools(params: {
  where?: Record<string, unknown>
  orderBy?: Record<string, string> | unknown
  take: number
}): Promise<ToolCardData[]> {
  const result = await safeQuery(() =>
    prisma.aiTool.findMany({
      ...params,
      include: {
        categories: { include: { category: true } },
        reviews: { select: { rating: true } },
      },
    } as any)
  )
  return (result || []) as unknown as ToolCardData[]
}

export async function TrendingToday() {
  const tools = await fetchTools({
    where: { isPublished: true },
    orderBy: { viewCount: "desc" },
    take: 6,
  })
  if (tools.length === 0) return null

  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Trending Today" description="Most viewed AI tools right now" href="/search?sort=popular" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, i) => <ToolCard key={tool.id} tool={tool} index={i} />)}
        </div>
      </div>
    </section>
  )
}

export async function MostReviewed() {
  const tools = await fetchTools({
    where: { isPublished: true },
    orderBy: { reviews: { _count: "desc" } },
    take: 6,
  })
  if (tools.length === 0) return null

  return (
    <section className="py-8 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Most Reviewed" description="Tools with the most user reviews" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, i) => <ToolCard key={tool.id} tool={tool} index={i} />)}
        </div>
      </div>
    </section>
  )
}

export async function EditorsChoice() {
  const tools = await fetchTools({
    where: { isPublished: true, isFeatured: true },
    orderBy: { featuredScore: "desc" },
    take: 3,
  })
  if (tools.length === 0) return null

  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Editor's Choice" description="Hand-picked by our team" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, i) => <ToolCard key={tool.id} tool={tool} index={i} />)}
        </div>
      </div>
    </section>
  )
}

export async function FastestGrowing() {
  const tools = await fetchTools({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  })
  if (tools.length === 0) return null

  return (
    <section className="py-8 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Fastest Growing" description="Newest AI tools added to our directory" href="/search?sort=newest" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, i) => <ToolCard key={tool.id} tool={tool} index={i} />)}
        </div>
      </div>
    </section>
  )
}

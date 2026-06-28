import { prisma } from "@/lib/prisma"
import { ToolCard } from "./tool-card"
import { SectionHeader } from "@/components/shared/section-header"
import { safeQuery } from "@/lib/utils"

export async function FeaturedTools() {
  const tools = (await safeQuery(() => prisma.aiTool.findMany({
    where: { isPublished: true, isFeatured: true },
    orderBy: { featuredScore: "desc" },
    take: 6,
    include: {
      categories: { include: { category: true } },
      reviews: { select: { rating: true } },
    },
  }))) || []

  if (tools.length === 0) return null

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Featured AI Tools"
          description="Hand-picked tools our editors recommend"
          href="/search?sort=popular"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

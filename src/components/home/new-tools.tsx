import { prisma } from "@/lib/prisma"
import { ToolCard } from "./tool-card"
import { SectionHeader } from "@/components/shared/section-header"
import { safeQuery } from "@/lib/utils"

export async function NewTools() {
  const tools = (await safeQuery(() => prisma.aiTool.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
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
          title="New Additions"
          description="Latest AI tools added to our directory"
          href="/search?sort=newest"
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

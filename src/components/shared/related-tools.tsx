import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { safeQuery } from "@/lib/utils"

interface RelatedToolsProps {
  currentToolId: string
  categoryId?: string
}

export async function RelatedTools({ currentToolId, categoryId }: RelatedToolsProps) {
  if (!categoryId) return null

  const tools = await safeQuery(() =>
    prisma.aiTool.findMany({
      where: {
        isPublished: true,
        id: { not: currentToolId },
        categories: { some: { categoryId } },
      },
      take: 4,
      orderBy: { viewCount: "desc" },
      select: { id: true, name: true, slug: true, tagline: true, pricing: true, viewCount: true },
    })
  ) || []

  if (tools.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Related Tools</h3>
      {tools.map((tool) => (
        <Link key={tool.id} href={`/ai-tool/${tool.slug}`}>
          <Card className="p-3 hover:border-primary/30 transition-colors">
            <p className="text-sm font-medium truncate">{tool.name}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{tool.tagline}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant={tool.pricing === "FREE" ? "success" : "secondary"} className="text-[10px]">{tool.pricing}</Badge>
              <span className="text-[10px] text-muted-foreground">{tool.viewCount} views</span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}

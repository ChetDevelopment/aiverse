import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export default async function AdminToolsPage() {
  const tools = await prisma.aiTool.findMany({
    orderBy: { createdAt: "desc" },
    include: { categories: { include: { category: true } }, _count: { select: { reviews: true } } },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">All Tools</h1>
        <Link href="/admin/tools/new">
          <Button>Add Tool</Button>
        </Link>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {tools.map((tool) => (
              <div key={tool.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Link href={`/ai-tool/${tool.slug}`} className="font-medium hover:text-primary">
                      {tool.name}
                    </Link>
                    <Link href={`/admin/tools/${tool.slug}/edit`} className="text-xs text-muted-foreground hover:text-primary">
                      Edit
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {tool.categories.map((tc) => (
                      <span key={tc.category.id} className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                        {tc.category.name}
                      </span>
                    ))}
                    <span className="text-xs text-muted-foreground">{tool._count.reviews} reviews</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={tool.isPublished ? "success" : "secondary"}>
                    {tool.isPublished ? "Published" : "Draft"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{tool.viewCount} views</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

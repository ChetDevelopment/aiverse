import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function AdminTagsPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { tools: true } } },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tags</h1>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="font-medium">{tag.name}</p>
                  <p className="text-xs text-muted-foreground">/{tag.slug}</p>
                </div>
                <span className="text-sm text-muted-foreground">{tag._count.tools} tools</span>
              </div>
            ))}
            {tags.length === 0 && (
              <p className="px-6 py-8 text-sm text-muted-foreground text-center">No tags yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

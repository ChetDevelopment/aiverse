import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Clock, Calendar } from "lucide-react"

export async function ToolGuides({ toolSlug }: { toolSlug: string }) {
  const guides = await prisma.blogPost.findMany({
    where: {
      published: true,
      tags: { contains: `tool:${toolSlug}` },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  if (guides.length === 0) return null

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          Guides & Tutorials
        </h3>
        <div className="space-y-3">
          {guides.map((guide) => (
            <Link
              key={guide.id}
              href={`/blog/${guide.slug}`}
              className="block rounded-lg p-2.5 hover:bg-accent transition-colors -mx-2.5"
            >
              <p className="text-sm font-medium leading-snug line-clamp-2">
                {guide.title}
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{guide.readTime} min</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{guide.createdAt.toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
        <Link
          href={`/blog?tool=${toolSlug}`}
          className="mt-3 block text-xs text-primary hover:underline text-center"
        >
          View all guides →
        </Link>
      </CardContent>
    </Card>
  )
}

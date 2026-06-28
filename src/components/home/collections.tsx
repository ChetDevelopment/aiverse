import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { SectionHeader } from "@/components/shared/section-header"
import { Card } from "@/components/ui/card"
import { safeQuery } from "@/lib/utils"
import { Zap, Code2, Palette, type LucideIcon } from "lucide-react"

const COLLECTION_DEFINITIONS: {
  slug: string
  name: string
  description: string
  icon: LucideIcon
  filter: Record<string, unknown>
}[] = [
  {
    slug: "best-free-ai-tools",
    name: "Best Free AI Tools",
    description: "Powerful AI tools that won't cost you a thing",
    icon: Zap,
    filter: { pricing: "FREE" },
  },
  {
    slug: "ai-for-developers",
    name: "AI for Developers",
    description: "Essential AI tools for coding and development",
    icon: Code2,
    filter: { categories: { some: { category: { slug: "coding" } } } },
  },
  {
    slug: "ai-content-creators",
    name: "AI for Content Creators",
    description: "Generate images, videos, and writing with AI",
    icon: Palette,
    filter: {
      categories: {
        some: {
          category: {
            slug: { in: ["image", "video", "writing"] },
          },
        },
      },
    },
  },
]

export async function Collections() {
  const collections = await Promise.all(
    COLLECTION_DEFINITIONS.map(async (def) => {
      const tools = await safeQuery(() =>
        prisma.aiTool.findMany({
          where: {
            isPublished: true,
            ...(def.filter as Record<string, unknown>),
          },
          take: 5,
          orderBy: { viewCount: "desc" },
          select: { name: true, slug: true },
        })
      ) || []
      return { ...def, tools }
    })
  )

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Curated Collections"
          description="Expertly curated collections to help you find the right tools"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <Card
              key={collection.slug}
              className="p-6 hover:border-primary/30 hover:shadow-md transition-all duration-200"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-4">
                <collection.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">{collection.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {collection.description}
              </p>
              {collection.tools.length > 0 && (
                <ul className="mt-4 space-y-1.5">
                  {collection.tools.map((tool) => (
                    <li key={tool.slug}>
                      <Link
                        href={`/ai-tool/${tool.slug}`}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {tool.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href={`/search?collection=${collection.slug}`}
                className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
              >
                View collection &rarr;
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

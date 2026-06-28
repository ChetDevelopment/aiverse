import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { ToolCard } from "@/components/home/tool-card"
import { SectionHeader } from "@/components/shared/section-header"

export const revalidate = 300

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { name: true, description: true },
  })

  if (!category) return {}

  return {
    title: `${category.name} AI Tools`,
    description:
      category.description ||
      `Browse the best ${category.name} AI tools. Compare features, pricing, and reviews.`,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/categories/${slug}`,
    },
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      tools: {
        include: {
          tool: {
            include: {
              categories: { include: { category: true } },
              reviews: { select: { rating: true } },
            },
          },
        },
      },
    },
  })

  if (!category) {
    notFound()
  }

  const tools = category.tools
    .filter((tc) => tc.tool.isPublished)
    .map((tc) => tc.tool)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} AI Tools`,
    description: category.description,
    url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/categories/${category.slug}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={`${category.name} AI Tools`}
            description={
              category.description ||
              `Browse the best ${category.name} AI tools`
            }
          />

          {tools.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool, i) => (
                <ToolCard key={tool.id} tool={tool} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg text-muted-foreground">
                No tools found in this category yet.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Check back soon as we&apos;re constantly adding new AI tools.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

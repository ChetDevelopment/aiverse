import Link from "next/link"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"
import { SectionHeader } from "@/components/shared/section-header"

export const revalidate = 300
import {
  MessageSquare,
  Code2,
  Image,
  Video,
  Mic,
  Megaphone,
  PenLine,
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  Zap,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse AI tools by category. Find the perfect AI for chat, coding, image generation, video, writing, and more.",
}

const categoryIcons: Record<string, LucideIcon> = {
  "chat-ai": MessageSquare,
  coding: Code2,
  image: Image,
  video: Video,
  voice: Mic,
  marketing: Megaphone,
  writing: PenLine,
  productivity: LayoutDashboard,
  business: Briefcase,
  education: GraduationCap,
  automation: Zap,
}

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { tools: true } } },
  })

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "AI Tools Categories",
    description: "Browse AI tools by category",
    itemListElement: categories.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "CollectionPage",
        name: c.name,
        url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/categories/${c.slug}`,
      },
    })),
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
            title="Categories"
            description="Browse AI tools by category to find exactly what you need"
          />

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => {
              const Icon = category.icon
                ? categoryIcons[category.icon]
                : undefined
              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                >
                  <Card className="flex items-center gap-4 p-5 hover:border-primary/30 hover:shadow-md transition-all duration-200 h-full">
                    {Icon && (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {category._count.tools} tool
                        {category._count.tools !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

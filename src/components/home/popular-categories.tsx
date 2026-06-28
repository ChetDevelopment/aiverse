import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { SectionHeader } from "@/components/shared/section-header"
import { Card } from "@/components/ui/card"
import { safeQuery } from "@/lib/utils"
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

export async function PopularCategories() {
  const categories = await safeQuery(() =>
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { tools: true } } },
    })
  ) || []

  if (categories.length === 0) return null

  return (
    <section className="py-16 bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Browse by Category"
          description="Find AI tools by category"
          href="/categories"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.map((category) => {
            const Icon = category.icon
              ? categoryIcons[category.icon]
              : undefined
            return (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <Card className="flex flex-col items-center justify-center gap-2 p-5 text-center hover:border-primary/30 hover:shadow-md transition-all duration-200 h-full">
                  {Icon && <Icon className="h-6 w-6 text-primary" />}
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {category._count.tools} tools
                  </span>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import {
  BookOpen,
  Layers,
  Sparkles,
  Puzzle,
  Shuffle,
  Tag,
  GraduationCap,
} from "lucide-react"

interface ContentRelationshipsProps {
  type: "tool" | "prompt" | "learning" | "workspace"
  slug?: string
  id?: string
}

interface Relationships {
  prompts?: { id: string; title: string; difficulty: string; tool: { name: string; slug: string } }[]
  learningPaths?: { slug: string; title: string; difficulty: string }[]
  blogPosts?: { slug: string; title: string; excerpt: string | null }[]
  useCases?: { slug: string; title: string; difficulty: string }[]
  stacks?: { id: string; name: string; emoji: string; likeCount: number }[]
  alternatives?: { id: string; name: string; slug: string; tagline: string }[]
  deals?: { id: string; toolName: string; description: string; dealType: string }[]
}

const sections = [
  {
    key: "prompts" as const,
    label: "Prompts",
    icon: Sparkles,
    href: (item: Record<string, unknown>) => `/prompts/${item.id}`,
    subtitle: (item: Record<string, unknown>) =>
      `${(item.tool as { name: string })?.name || ""} · ${item.difficulty || ""}`,
  },
  {
    key: "learningPaths" as const,
    label: "Learning Paths",
    icon: GraduationCap,
    href: (item: Record<string, unknown>) => `/learn/${item.slug}`,
    subtitle: (item: Record<string, unknown>) => `${item.difficulty || ""}`,
  },
  {
    key: "blogPosts" as const,
    label: "Blog Posts",
    icon: BookOpen,
    href: (item: Record<string, unknown>) => `/blog/${item.slug}`,
    subtitle: (item: Record<string, unknown>) =>
      `${(item.excerpt as string) || ""}`,
  },
  {
    key: "useCases" as const,
    label: "Use Cases",
    icon: Puzzle,
    href: (item: Record<string, unknown>) => `/usecases/${item.slug}`,
    subtitle: (item: Record<string, unknown>) => `${item.difficulty || ""}`,
  },
  {
    key: "stacks" as const,
    label: "Stacks",
    icon: Layers,
    href: (item: Record<string, unknown>) => `/stacks/${item.id}`,
    subtitle: (item: Record<string, unknown>) =>
      `${(item.likeCount as number) || 0} likes`,
  },
  {
    key: "alternatives" as const,
    label: "Alternatives",
    icon: Shuffle,
    href: (item: Record<string, unknown>) => `/ai-tool/${item.slug}`,
    subtitle: (item: Record<string, unknown>) =>
      `${(item.tagline as string) || ""}`,
  },
  {
    key: "deals" as const,
    label: "Deals",
    icon: Tag,
    href: () => "/deals",
    subtitle: (item: Record<string, unknown>) =>
      `${(item.description as string) || ""}`,
  },
]

export function ContentRelationships({ slug, id }: ContentRelationshipsProps) {
  const [relationships, setRelationships] = useState<Relationships | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const identifier = slug || id
    if (!identifier) return

    fetch(
      `/api/recommendations?type=tool-relationships&tool=${encodeURIComponent(identifier)}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch")
        return res.json()
      })
      .then((data) => setRelationships(data))
      .catch(() => setRelationships({}))
      .finally(() => setLoading(false))
  }, [slug, id])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-24 rounded bg-secondary" />
            <div className="h-10 rounded bg-secondary" />
            <div className="h-10 rounded bg-secondary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!relationships) return null

  const hasAny = Object.values(relationships).some(
    (arr) => arr && arr.length > 0
  )
  if (!hasAny) return null

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <Layers className="h-4 w-4 text-primary" />
          Related Content
        </h3>
        <div className="space-y-4">
          {sections.map(({ key, label, icon: Icon, href, subtitle }) => {
            const items = relationships[key]
            if (!items || items.length === 0) return null

            return (
              <div key={key}>
                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Icon className="h-3 w-3" />
                  {label}
                </h4>
                <div className="space-y-1.5">
                  {items.slice(0, 4).map((item, i) => {
                    const record = item as unknown as Record<string, unknown>
                    return (
                      <Link
                        key={(record.id as string) || (record.slug as string) || i}
                        href={href(record)}
                        className="-mx-2 block rounded-lg p-2 transition-colors hover:bg-accent"
                      >
                        <p className="line-clamp-1 text-sm font-medium leading-snug">
                          {(record.title as string) ||
                            (record.name as string) ||
                            (record.toolName as string) ||
                            ""}
                        </p>
                        {subtitle(record) && (
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                            {subtitle(record)}
                          </p>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

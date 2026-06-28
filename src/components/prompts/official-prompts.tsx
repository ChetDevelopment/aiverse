import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Star } from "lucide-react"
import { formatRating } from "@/lib/utils"

export async function OfficialPrompts({ toolId, toolSlug }: { toolId: string; toolSlug: string }) {
  const prompts = await prisma.prompt.findMany({
    where: { toolId, isOfficial: true },
    orderBy: { useCount: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      description: true,
      difficulty: true,
      category: true,
      avgRating: true,
      ratingCount: true,
      useCount: true,
    },
  })

  if (prompts.length === 0) return null

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Official Prompts
        </h3>
        <div className="space-y-3">
          {prompts.map((prompt) => (
            <Link
              key={prompt.id}
              href={`/prompts/${prompt.id}`}
              className="block rounded-lg p-2.5 hover:bg-accent transition-colors -mx-2.5"
            >
              <p className="text-sm font-medium leading-snug line-clamp-2">
                {prompt.title}
              </p>
              {prompt.description && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                  {prompt.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {prompt.difficulty}
                </Badge>
                <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                  <Star className="h-3 w-3" />
                  {prompt.ratingCount > 0 ? formatRating(prompt.avgRating) : "—"}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {prompt.useCount} uses
                </span>
              </div>
            </Link>
          ))}
        </div>
        <Link
          href={`/ai-tool/${toolSlug}/prompts`}
          className="mt-3 block text-xs text-primary hover:underline text-center"
        >
          View all prompts →
        </Link>
      </CardContent>
    </Card>
  )
}

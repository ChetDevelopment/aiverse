import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PromptCard } from "@/components/prompts/prompt-card"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tool = await prisma.aiTool.findUnique({
    where: { slug },
    select: { name: true },
  })
  if (!tool) return {}
  return {
    title: `${tool.name} Prompts — AIVerse`,
    description: `Browse prompts for ${tool.name}`,
  }
}

export default async function ToolPromptsPage({ params }: Props) {
  const { slug } = await params

  const tool = await prisma.aiTool.findUnique({
    where: { slug, isPublished: true },
    select: { id: true, name: true, slug: true, logo: true },
  })

  if (!tool) {
    notFound()
  }

  const prompts = await prisma.prompt.findMany({
    where: { toolId: tool.id },
    include: {
      tool: { select: { id: true, name: true, slug: true, logo: true } },
      user: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { favorites: true } },
    },
    orderBy: [{ isOfficial: "desc" }, { useCount: "desc" }],
  })

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href={`/ai-tool/${tool.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {tool.name}
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border bg-secondary text-lg font-bold text-primary overflow-hidden">
            {tool.logo ? (
              <img src={tool.logo} alt={tool.name} className="h-full w-full object-contain p-1" />
            ) : (
              tool.name.charAt(0)
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{tool.name} Prompts</h1>
            <p className="text-muted-foreground text-sm">
              {prompts.length} prompt{prompts.length !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>

        {prompts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No prompts yet for this tool</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {prompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

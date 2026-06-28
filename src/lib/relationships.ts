import { prisma } from "@/lib/prisma"

export interface ContentRelationships {
  prompts?: { id: string; title: string; difficulty: string; tool: { name: string; slug: string } }[]
  learningPaths?: { slug: string; title: string; difficulty: string }[]
  blogPosts?: { slug: string; title: string; excerpt: string | null }[]
  useCases?: { slug: string; title: string; difficulty: string }[]
  stacks?: { id: string; name: string; emoji: string; likeCount: number }[]
  workspaces?: { id: string; name: string; emoji: string }[]
  alternatives?: { id: string; name: string; slug: string; tagline: string }[]
  deals?: { id: string; toolName: string; description: string; dealType: string }[]
  news?: { id: number; title: string; url: string; timeAgo: string }[]
}

export async function getToolRelationships(slug: string, limit = 5): Promise<ContentRelationships> {
  const tool = await prisma.aiTool.findUnique({
    where: { slug },
    select: { id: true, categories: { include: { category: { select: { slug: true } } } } },
  })
  if (!tool) return {}

  const catSlugs = tool.categories.map((tc) => tc.category.slug)

  const [prompts, learningPaths, blogPosts, useCases, stacks, alternatives, deals] = await Promise.all([
    prisma.prompt.findMany({ where: { toolId: tool.id, isOfficial: true }, take: limit, orderBy: { useCount: "desc" }, select: { id: true, title: true, difficulty: true, tool: { select: { name: true, slug: true } } } }),
    prisma.learningPath.findMany({ where: { published: true, category: { in: catSlugs } }, take: limit, orderBy: { updatedAt: "desc" }, select: { slug: true, title: true, difficulty: true } }),
    prisma.blogPost.findMany({ where: { published: true, tags: { contains: slug } }, take: limit, orderBy: { createdAt: "desc" }, select: { slug: true, title: true, excerpt: true } }),
    prisma.useCase.findMany({ where: { tools: { some: { toolId: tool.id } } }, take: limit, select: { slug: true, title: true, difficulty: true } }),
    prisma.stack.findMany({ where: { isPublic: true, items: { some: { toolId: tool.id } } }, take: limit, orderBy: { likeCount: "desc" }, select: { id: true, name: true, emoji: true, likeCount: true } }),
    prisma.alternative.findMany({ where: { toolId: tool.id }, take: limit, include: { alternative: { select: { id: true, name: true, slug: true, tagline: true } } } }),
    prisma.freeDeal.findMany({ where: { toolSlug: slug, verified: true }, take: limit, select: { id: true, toolName: true, description: true, dealType: true } }),
  ])

  return {
    prompts: prompts.length > 0 ? prompts : undefined,
    learningPaths: learningPaths.length > 0 ? learningPaths : undefined,
    blogPosts: blogPosts.length > 0 ? blogPosts : undefined,
    useCases: useCases.length > 0 ? useCases : undefined,
    stacks: stacks.length > 0 ? stacks : undefined,
    alternatives: alternatives.map((a) => a.alternative),
    deals: deals.length > 0 ? deals : undefined,
  }
}

export async function getPromptRelationships(promptId: string, limit = 5): Promise<ContentRelationships> {
  const prompt = await prisma.prompt.findUnique({ where: { id: promptId }, select: { toolId: true, category: true } })
  if (!prompt) return {}

  const [learningPaths, useCases] = await Promise.all([
    prisma.learningPath.findMany({ where: { published: true, category: prompt.category || undefined }, take: limit, select: { slug: true, title: true, difficulty: true } }),
    prisma.useCase.findMany({ where: { tools: { some: { toolId: prompt.toolId } } }, take: limit, select: { slug: true, title: true, difficulty: true } }),
  ])

  return { learningPaths: learningPaths.length > 0 ? learningPaths : undefined, useCases: useCases.length > 0 ? useCases : undefined }
}

export async function getWorkspaceRecommendations(userId: string, limit = 5): Promise<ContentRelationships> {
  const [recentTools, favorites, bookmarks] = await Promise.all([
    prisma.history.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10, include: { tool: { select: { id: true, name: true, slug: true } } } }),
    prisma.favorite.findMany({ where: { userId }, include: { tool: { select: { id: true, name: true, slug: true } } }, take: 10 }),
    prisma.bookmark.findMany({ where: { userId }, include: { tool: { select: { id: true, name: true, slug: true } } }, take: 10 }),
  ])

  const toolIds = [...new Set([...recentTools, ...favorites, ...bookmarks].map((i) => i.tool.id))]

  const [prompts, learningPaths, stacks] = await Promise.all([
    prisma.prompt.findMany({ where: { toolId: { in: toolIds }, isOfficial: true }, take: limit, orderBy: { useCount: "desc" }, select: { id: true, title: true, difficulty: true, tool: { select: { name: true, slug: true } } } }),
    prisma.learningPath.findMany({ where: { published: true }, take: limit, orderBy: { updatedAt: "desc" }, select: { slug: true, title: true, difficulty: true } }),
    prisma.stack.findMany({ where: { isPublic: true, items: { some: { toolId: { in: toolIds } } } }, take: limit, orderBy: { likeCount: "desc" }, select: { id: true, name: true, emoji: true, likeCount: true } }),
  ])

  return { prompts: prompts.length > 0 ? prompts : undefined, learningPaths: learningPaths.length > 0 ? learningPaths : undefined, stacks: stacks.length > 0 ? stacks : undefined }
}

export async function getLearningPathRelationships(slug: string, limit = 5): Promise<ContentRelationships> {
  const path = await prisma.learningPath.findUnique({ where: { slug }, select: { category: true } })
  if (!path) return {}

  const [relatedPaths, blogPosts, useCases] = await Promise.all([
    prisma.learningPath.findMany({ where: { published: true, category: path.category, slug: { not: slug } }, take: limit, select: { slug: true, title: true, difficulty: true } }),
    prisma.blogPost.findMany({ where: { published: true, tags: { contains: path.category || undefined } }, take: limit, orderBy: { createdAt: "desc" }, select: { slug: true, title: true, excerpt: true } }),
    prisma.useCase.findMany({ where: { category: path.category }, take: limit, select: { slug: true, title: true, difficulty: true } }),
  ])

  return { learningPaths: relatedPaths.length > 0 ? relatedPaths : undefined, blogPosts: blogPosts.length > 0 ? blogPosts : undefined, useCases: useCases.length > 0 ? useCases : undefined }
}

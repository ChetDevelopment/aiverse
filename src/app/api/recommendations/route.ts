import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { apiSuccess, apiError } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") || "home"
  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 6, 20)
  const toolSlug = request.nextUrl.searchParams.get("tool") || undefined

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id

  // Track category interests from user activity
  let categoryInterests: string[] = []
  let recentToolIds: string[] = []
  let favoriteToolIds: string[] = []
  let bookmarkToolIds: string[] = []

  if (userId) {
    const [favorites, bookmarks, history, collections] = await Promise.all([
      prisma.favorite.findMany({ where: { userId }, include: { tool: { include: { categories: { include: { category: true } } } } }, take: 20 }),
      prisma.bookmark.findMany({ where: { userId }, include: { tool: { include: { categories: { include: { category: true } } } } }, take: 20 }),
      prisma.history.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, include: { tool: { include: { categories: { include: { category: true } } } } }, take: 30 }),
      prisma.collection.findMany({ where: { userId }, include: { items: { include: { tool: true } } }, take: 10 }),
    ])

    const allTools = [...favorites.map((f) => f.tool), ...bookmarks.map((b) => b.tool), ...history.map((h) => h.tool)]
    const seenIds = new Set<string>()
    recentToolIds = history.map((h) => h.tool.id).filter((id) => { const s = seenIds.has(id); seenIds.add(id); return !s })
    favoriteToolIds = [...new Set(favorites.map((f) => f.tool.id))]
    bookmarkToolIds = [...new Set(bookmarks.map((b) => b.tool.id))]

    const catCount = new Map<string, number>()
    allTools.forEach((t) => t.categories.forEach((tc) => catCount.set(tc.category.slug, (catCount.get(tc.category.slug) || 0) + 1)))
    categoryInterests = [...catCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([slug]) => slug)
  }

  const allToolIds = [...new Set([...favoriteToolIds, ...bookmarkToolIds, ...recentToolIds])]

  try {
    switch (type) {
      case "trending-tools": {
        const tools = await prisma.aiTool.findMany({
          where: { isPublished: true },
          orderBy: { viewCount: "desc" },
          take: limit,
          include: { categories: { include: { category: true } }, reviews: { select: { rating: true } } },
        })
        return apiSuccess(tools)
      }

      case "personalized-tools": {
        if (categoryInterests.length === 0) {
          const tools = await prisma.aiTool.findMany({
            where: { isPublished: true, isFeatured: true },
            orderBy: { featuredScore: "desc" },
            take: limit,
            include: { categories: { include: { category: true } }, reviews: { select: { rating: true } } },
          })
          return apiSuccess(tools)
        }
        const tools = await prisma.aiTool.findMany({
          where: { isPublished: true, categories: { some: { category: { slug: { in: categoryInterests } } } } },
          orderBy: { viewCount: "desc" },
          take: limit,
          include: { categories: { include: { category: true } }, reviews: { select: { rating: true } } },
        })
        return apiSuccess(tools)
      }

      case "continue-learning": {
        if (!userId) return apiSuccess([])
        const workspaces = await prisma.workspace.findMany({ where: { userId, archived: false }, orderBy: { updatedAt: "desc" }, take: 3 })
        const stacks = await prisma.stack.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 3 })
        const learningPaths = await prisma.learningPath.findMany({ where: { published: true }, take: 3, orderBy: { updatedAt: "desc" }, select: { slug: true, title: true, difficulty: true } })
        return apiSuccess({ workspaces, stacks, learningPaths })
      }

      case "tool-relationships": {
        if (!toolSlug) return apiError("Missing tool slug")
        const { getToolRelationships } = await import("@/lib/relationships")
        const rels = await getToolRelationships(toolSlug, limit)
        return apiSuccess(rels)
      }

      case "prompts": {
        const prompts = await prisma.prompt.findMany({
          where: userId ? {} : { isOfficial: true },
          orderBy: { useCount: "desc" },
          take: limit,
          include: { tool: { select: { name: true, slug: true } } },
        })
        return apiSuccess(prompts)
      }

      case "stacks": {
        const stacks = await prisma.stack.findMany({
          where: { isPublic: true },
          orderBy: { likeCount: "desc" },
          take: limit,
          include: { user: { select: { name: true } }, _count: { select: { items: true } } },
        })
        return apiSuccess(stacks)
      }

      case "learning-paths": {
        const paths = await prisma.learningPath.findMany({
          where: { published: true },
          take: limit,
          orderBy: { updatedAt: "desc" },
        })
        return apiSuccess(paths)
      }

      case "workspace-suggestions": {
        if (!userId || allToolIds.length === 0) return apiSuccess([])
        const prompts = await prisma.prompt.findMany({
          where: { toolId: { in: allToolIds }, isOfficial: true },
          take: 3,
          orderBy: { useCount: "desc" },
          select: { id: true, title: true, difficulty: true, tool: { select: { name: true } } },
        })
        const stacks = await prisma.stack.findMany({
          where: { isPublic: true, items: { some: { toolId: { in: allToolIds } } } },
          take: 3,
          orderBy: { likeCount: "desc" },
          select: { id: true, name: true, emoji: true },
        })
        return apiSuccess({ prompts, stacks })
      }

      default: {
        const trendingTools = await prisma.aiTool.findMany({
          where: { isPublished: true },
          orderBy: { viewCount: "desc" },
          take: 6,
          include: { categories: { include: { category: true } }, reviews: { select: { rating: true } } },
        })
        const prompts = await prisma.prompt.findMany({
          where: { isOfficial: true },
          orderBy: { useCount: "desc" },
          take: 4,
          include: { tool: { select: { name: true, slug: true } } },
        })
        const learningPaths = await prisma.learningPath.findMany({
          where: { published: true },
          take: 3,
          orderBy: { updatedAt: "desc" },
        })
        const stacks = await prisma.stack.findMany({
          where: { isPublic: true },
          orderBy: { likeCount: "desc" },
          take: 3,
          include: { _count: { select: { items: true } } },
        })

        return apiSuccess({
          trendingTools,
          prompts,
          learningPaths,
          stacks,
          userContext: userId
            ? {
                categoryInterests,
                recentToolIds,
                favoriteCount: favoriteToolIds.length,
                workspaceCount: await prisma.workspace.count({ where: { userId, archived: false } }),
                stackCount: await prisma.stack.count({ where: { userId } }),
              }
            : null,
        })
      }
    }
  } catch (e) {
    return apiError("Failed to fetch recommendations")
  }
}

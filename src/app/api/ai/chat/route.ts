import { NextRequest } from "next/server"
import { apiError, apiSuccess } from "@/lib/api-utils"
import { prisma } from "@/lib/prisma"

interface ChatRequest {
  message: string
  history: { role: string; content: string }[]
  userId?: string
  context?: {
    page?: string
    category?: string
    searchQuery?: string
    toolSlug?: string
    savedCount?: number
    compareCount?: number
  }
}

interface UserContext {
  savedTools: { name: string; slug: string }[]
  recentViewed: { name: string; slug: string }[]
  favoriteCategories: string[]
  workspaceNames: string[]
  learningPaths: { title: string; slug: string }[]
}

async function getUserContext(userId: string): Promise<UserContext | null> {
  try {
    const [favorites, bookmarks, history, workspaces, categories, learningPaths] =
      await Promise.all([
        prisma.favorite.findMany({
          where: { userId },
          include: { tool: { select: { name: true, slug: true } } },
          take: 10,
        }),
        prisma.bookmark.findMany({
          where: { userId },
          include: { tool: { select: { name: true, slug: true } } },
          take: 10,
        }),
        prisma.history.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          include: { tool: { select: { name: true, slug: true } } },
          take: 10,
        }),
        prisma.workspace.findMany({
          where: { userId, archived: false },
          select: { name: true },
          take: 5,
        }),
        prisma.favorite.findMany({
          where: { userId },
          include: {
            tool: {
              select: {
                categories: {
                  include: { category: { select: { name: true } } },
                },
              },
            },
          },
          take: 20,
        }),
        prisma.learningPath.findMany({
          where: { published: true },
          take: 5,
          select: { title: true, slug: true },
        }),
      ])

    const savedTools = [
      ...favorites.map((f) => ({ name: f.tool.name, slug: f.tool.slug })),
      ...bookmarks.map((b) => ({ name: b.tool.name, slug: b.tool.slug })),
    ]

    const recentViewed = history.map((h) => ({
      name: h.tool.name,
      slug: h.tool.slug,
    }))

    const catCount = new Map<string, number>()
    categories.forEach((fav) =>
      fav.tool.categories.forEach((tc) =>
        catCount.set(tc.category.name, (catCount.get(tc.category.name) || 0) + 1)
      )
    )
    const favoriteCategories = [...catCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name)

    return {
      savedTools: [
        ...new Map(savedTools.map((t) => [t.slug, t])).values(),
      ],
      recentViewed: [
        ...new Map(recentViewed.map((t) => [t.slug, t])).values(),
      ],
      favoriteCategories,
      workspaceNames: workspaces.map((w) => w.name),
      learningPaths: learningPaths.map((lp) => ({
        title: lp.title,
        slug: lp.slug,
      })),
    }
  } catch {
    return null
  }
}

function buildPersonalizedPrompt(
  context: ChatRequest["context"],
  userContext: UserContext | null
): string {
  let prompt = `You are AIVerse's AI assistant. You help users find the perfect AI tools for their needs.
You have access to real tool data. Be concise, helpful, and recommend specific tools.
Always mention pricing (Free, Freemium, Paid) when recommending.
If the user asks about a specific category, recommend the top tools in that category.
Keep responses under 150 words. Format with bullet points for multiple recommendations.`

  if (userContext) {
    const parts: string[] = []
    if (userContext.savedTools.length > 0) {
      parts.push(
        `${userContext.savedTools.length} saved tools in their favorites`
      )
    }
    if (userContext.recentViewed.length > 0) {
      parts.push(
        `Recently viewed: ${userContext.recentViewed.map((t) => t.name).join(", ")}`
      )
    }
    if (userContext.workspaceNames.length > 0) {
      parts.push(
        `${userContext.workspaceNames.length} active workspaces: "${userContext.workspaceNames.join('", "')}"`
      )
    }
    if (userContext.favoriteCategories.length > 0) {
      parts.push(
        `Interested in: ${userContext.favoriteCategories.join(", ")}`
      )
    }
    if (userContext.learningPaths.length > 0) {
      parts.push(
        `${userContext.learningPaths.length} learning path${userContext.learningPaths.length > 1 ? "s" : ""} in progress: ${userContext.learningPaths.map((lp) => lp.title).join(", ")}`
      )
    }

    prompt += `\n\nYou are AIVerse AI assistant. The user has:\n- ${parts.join("\n- ")}\n\nUse this context to provide personalized recommendations. Welcome them back warmly.`
  }

  if (context?.toolSlug) {
    prompt += `\n\nThe user is currently viewing the tool "${context.toolSlug}". Help them understand this tool better, suggest alternatives, and recommend related tools they might also find useful.`
  }

  if (context?.category) {
    prompt += `\n\nThe user is browsing the "${context.category}" category. Recommend popular tools in this category and help them find the best fit for their needs.`
  }

  if (context?.searchQuery) {
    prompt += `\n\nThe user is searching for "${context.searchQuery}". Help them refine their search, suggest related keywords, and recommend tools that match their query.`
  }

  if (context?.savedCount && context.savedCount > 0) {
    prompt += `\n\nThe user has ${context.savedCount} saved tools. You can reference this when making personalized recommendations.`
  }

  return prompt
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { message, history, context, userId } = body

    let userContext: UserContext | null = null
    if (userId) {
      userContext = await getUserContext(userId)
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: buildPersonalizedPrompt(context, userContext),
          },
          ...(history || []).slice(-6),
          { role: "user", content: message },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenAI API error:", response.status, errorText)
      return apiError("AI service temporarily unavailable", 503)
    }

    const data = await response.json()
    const reply =
      data.choices?.[0]?.message?.content ||
      "I'm not sure how to help with that. Try asking about specific AI tool categories like image generation, coding, or writing."

    return apiSuccess({ reply })
  } catch (error) {
    console.error("AI chat error:", error)
    return apiError("AI service temporarily unavailable", 503)
  }
}

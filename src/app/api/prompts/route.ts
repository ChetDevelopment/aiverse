import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import { apiError, apiSuccess, handleApiError, requireApiAuth } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const toolId = searchParams.get("toolId")
  const category = searchParams.get("category")
  const difficulty = searchParams.get("difficulty")
  const isOfficial = searchParams.get("isOfficial")
  const search = searchParams.get("search")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50)

  const where: Prisma.PromptWhereInput = {}

  if (toolId) where.toolId = toolId
  if (category) where.category = category
  if (difficulty) where.difficulty = difficulty
  if (isOfficial === "true") where.isOfficial = true
  if (isOfficial === "false") where.isOfficial = false
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ]
  }

  const [items, total] = await Promise.all([
    prisma.prompt.findMany({
      where,
      include: {
        tool: { select: { id: true, name: true, slug: true, logo: true } },
        user: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { favorites: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.prompt.count({ where }),
  ])

  return apiSuccess({
    items,
    total,
    page,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  })
}

export async function POST(request: Request) {
  try {
    const user = await requireApiAuth()
    const body = await request.json()
    const { toolId, title, content, description, category, difficulty, language } = body

    if (!toolId || !title || !content) {
      return apiError("toolId, title, and content are required")
    }

    const tool = await prisma.aiTool.findUnique({ where: { id: toolId } })
    if (!tool) {
      return apiError("Tool not found", 404)
    }

    const prompt = await prisma.prompt.create({
      data: {
        toolId,
        title,
        content,
        description: description || null,
        category: category || null,
        difficulty: difficulty || "beginner",
        language: language || "en",
        userId: user.id,
      },
      include: {
        tool: { select: { id: true, name: true, slug: true, logo: true } },
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    })

    return apiSuccess(prompt, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

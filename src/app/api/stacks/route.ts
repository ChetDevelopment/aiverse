import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, apiSuccess, handleApiError, requireApiAuth } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const userId = searchParams.get("userId")
  const mine = searchParams.get("mine")

  const where: Record<string, unknown> = {}

  if (mine === "true" && userId) {
    where.userId = userId
  } else {
    where.isPublic = true
    if (userId) {
      where.OR = [
        { isPublic: true },
        { userId },
      ]
    }
    if (query) {
      where.AND = [
        { isPublic: true },
        {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
      ]
    }
  }

  const stacks = await prisma.stack.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { items: true, comments: true } },
    },
    orderBy: [{ likeCount: "desc" }, { createdAt: "desc" }],
  })

  return apiSuccess({ data: stacks })
}

export async function POST(request: Request) {
  try {
    const user = await requireApiAuth()
    const body = await request.json()

    const stack = await prisma.stack.create({
      data: {
        name: body.name,
        description: body.description,
        emoji: body.emoji || "🔧",
        isPublic: body.isPublic !== false,
        userId: user.id,
        items: body.toolIds
          ? { create: body.toolIds.map((toolId: string, i: number) => ({ toolId, order: i })) }
          : undefined,
      },
      include: { _count: { select: { items: true } } },
    })

    return apiSuccess(stack, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, apiSuccess, handleApiError, requireApiAdmin } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const category = searchParams.get("category")

  const where: Record<string, unknown> = {}

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ]
  }

  if (category) {
    where.category = category
  }

  const useCases = await prisma.useCase.findMany({
    where,
    include: { _count: { select: { tools: true } } },
    orderBy: { createdAt: "desc" },
  })

  return apiSuccess({ data: useCases })
}

export async function POST(request: Request) {
  try {
    await requireApiAdmin()
    const body = await request.json()

    const useCase = await prisma.useCase.create({
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        icon: body.icon,
        difficulty: body.difficulty || "beginner",
        estimatedTime: body.estimatedTime,
        category: body.category,
        steps: body.steps || [],
        tools: body.toolIds
          ? { create: body.toolIds.map((toolId: string, i: number) => ({ toolId, order: i })) }
          : undefined,
      },
    })

    return apiSuccess(useCase, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

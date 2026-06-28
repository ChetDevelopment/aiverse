import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, apiSuccess, handleApiError, requireApiAuth } from "@/lib/api-utils"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiAuth()
    const { id } = await params
    const { rating } = await request.json()

    if (!rating || rating < 1 || rating > 5) {
      return apiError("Rating must be between 1 and 5")
    }

    const prompt = await prisma.prompt.findUnique({ where: { id } })
    if (!prompt) {
      return apiError("Prompt not found", 404)
    }

    await prisma.promptRating.upsert({
      where: { promptId_userId: { promptId: id, userId: user.id } },
      update: { rating },
      create: { promptId: id, userId: user.id, rating },
    })

    const aggregate = await prisma.promptRating.aggregate({
      where: { promptId: id },
      _avg: { rating: true },
      _count: { rating: true },
    })

    const updated = await prisma.prompt.update({
      where: { id },
      data: {
        avgRating: aggregate._avg.rating ?? 0,
        ratingCount: aggregate._count.rating,
      },
    })

    return apiSuccess(updated)
  } catch (error) {
    return handleApiError(error)
  }
}

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, apiSuccess, handleApiError, requireApiAuth } from "@/lib/api-utils"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiAuth()
    const { id } = await params

    const prompt = await prisma.prompt.findUnique({ where: { id } })
    if (!prompt) {
      return apiError("Prompt not found", 404)
    }

    const existing = await prisma.promptFavorite.findUnique({
      where: { promptId_userId: { promptId: id, userId: user.id } },
    })

    if (existing) {
      await prisma.promptFavorite.delete({
        where: { promptId_userId: { promptId: id, userId: user.id } },
      })
      return apiSuccess({ favorited: false })
    } else {
      await prisma.promptFavorite.create({
        data: { promptId: id, userId: user.id },
      })
      return apiSuccess({ favorited: true })
    }
  } catch (error) {
    return handleApiError(error)
  }
}

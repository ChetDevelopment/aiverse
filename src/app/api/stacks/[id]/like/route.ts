import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, apiSuccess, handleApiError, requireApiAuth } from "@/lib/api-utils"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiAuth()
    const { id } = await params

    const stack = await prisma.stack.findUnique({ where: { id } })
    if (!stack) return apiError("Stack not found", 404)

    const existing = await prisma.stackLike.findUnique({
      where: { stackId_userId: { stackId: id, userId: user.id } },
    })

    if (existing) {
      await prisma.stackLike.delete({ where: { id: existing.id } })
      await prisma.stack.update({
        where: { id },
        data: { likeCount: { decrement: 1 } },
      })
      return apiSuccess({ liked: false, likeCount: stack.likeCount - 1 })
    } else {
      await prisma.stackLike.create({
        data: { stackId: id, userId: user.id },
      })
      await prisma.stack.update({
        where: { id },
        data: { likeCount: { increment: 1 } },
      })
      return apiSuccess({ liked: true, likeCount: stack.likeCount + 1 })
    }
  } catch (error) {
    return handleApiError(error)
  }
}

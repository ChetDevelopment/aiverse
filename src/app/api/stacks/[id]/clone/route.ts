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

    const original = await prisma.stack.findUnique({
      where: { id },
      include: { items: { orderBy: { order: "asc" } } },
    })

    if (!original) return apiError("Stack not found", 404)

    const clone = await prisma.stack.create({
      data: {
        name: `${original.name} (copy)`,
        description: original.description,
        emoji: original.emoji,
        isPublic: false,
        userId: user.id,
        items: {
          create: original.items.map((item) => ({
            toolId: item.toolId,
            order: item.order,
          })),
        },
      },
      include: { _count: { select: { items: true } } },
    })

    await prisma.stack.update({
      where: { id },
      data: { cloneCount: { increment: 1 } },
    })

    return apiSuccess(clone, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

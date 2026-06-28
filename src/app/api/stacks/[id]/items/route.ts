import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, apiSuccess, handleApiError, requireApiAuth } from "@/lib/api-utils"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiAuth()
    const { id } = await params

    const stack = await prisma.stack.findUnique({ where: { id } })
    if (!stack) return apiError("Stack not found", 404)
    if (stack.userId !== user.id) return apiError("Forbidden", 403)

    const body = await request.json()
    const maxOrder = await prisma.stackItem.aggregate({
      where: { stackId: id },
      _max: { order: true },
    })

    const item = await prisma.stackItem.create({
      data: {
        stackId: id,
        toolId: body.toolId,
        order: body.order ?? (maxOrder._max.order ?? -1) + 1,
      },
      include: { tool: true },
    })

    return apiSuccess(item, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiAuth()
    const { id } = await params

    const stack = await prisma.stack.findUnique({ where: { id } })
    if (!stack) return apiError("Stack not found", 404)
    if (stack.userId !== user.id) return apiError("Forbidden", 403)

    const body = await request.json()
    const { itemIds } = body as { itemIds: string[] }

    await Promise.all(
      itemIds.map((itemId, index) =>
        prisma.stackItem.update({
          where: { id: itemId },
          data: { order: index },
        })
      )
    )

    return apiSuccess({ reordered: true })
  } catch (error) {
    return handleApiError(error)
  }
}

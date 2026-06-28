import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, apiSuccess, handleApiError, requireApiAuth } from "@/lib/api-utils"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const stack = await prisma.stack.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
      items: {
        include: {
          tool: {
            include: {
              categories: { include: { category: true } },
              reviews: { select: { rating: true } },
            },
          },
        },
        orderBy: { order: "asc" },
      },
      _count: { select: { items: true, likes: true, comments: true } },
    },
  })

  if (!stack) return apiError("Stack not found", 404)

  return apiSuccess({ data: stack })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiAuth()
    const { id } = await params

    const existing = await prisma.stack.findUnique({ where: { id } })
    if (!existing) return apiError("Stack not found", 404)
    if (existing.userId !== user.id) return apiError("Forbidden", 403)

    const body = await request.json()

    const stack = await prisma.stack.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        emoji: body.emoji,
        isPublic: body.isPublic,
      },
    })

    return apiSuccess(stack)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiAuth()
    const { id } = await params

    const existing = await prisma.stack.findUnique({ where: { id } })
    if (!existing) return apiError("Stack not found", 404)
    if (existing.userId !== user.id) return apiError("Forbidden", 403)

    await prisma.stack.delete({ where: { id } })

    return apiSuccess({ deleted: true })
  } catch (error) {
    return handleApiError(error)
  }
}

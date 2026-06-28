import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, apiSuccess, handleApiError, requireApiAuth } from "@/lib/api-utils"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const comments = await prisma.stackComment.findMany({
    where: { stackId: id },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
  })

  return apiSuccess(comments)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiAuth()
    const { id } = await params

    const stack = await prisma.stack.findUnique({ where: { id } })
    if (!stack) return apiError("Stack not found", 404)

    const body = await request.json()
    if (!body.content?.trim()) return apiError("Content is required")

    const comment = await prisma.stackComment.create({
      data: {
        stackId: id,
        userId: user.id,
        content: body.content,
      },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    })

    return apiSuccess(comment, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

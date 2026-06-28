import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, apiSuccess, handleApiError, requireApiAuth } from "@/lib/api-utils"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const prompt = await prisma.prompt.findUnique({
    where: { id },
    include: {
      tool: { select: { id: true, name: true, slug: true, logo: true } },
      user: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { favorites: true } },
    },
  })

  if (!prompt) {
    return apiError("Prompt not found", 404)
  }

  return apiSuccess(prompt)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiAuth()
    const { id } = await params

    const existing = await prisma.prompt.findUnique({ where: { id } })
    if (!existing) {
      return apiError("Prompt not found", 404)
    }

    if (existing.userId !== user.id && user.role !== "ADMIN") {
      return apiError("Forbidden", 403)
    }

    const body = await request.json()
    const { title, content, description, category, difficulty, language } = body

    const prompt = await prisma.prompt.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(difficulty !== undefined && { difficulty }),
        ...(language !== undefined && { language }),
      },
      include: {
        tool: { select: { id: true, name: true, slug: true, logo: true } },
        user: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { favorites: true } },
      },
    })

    return apiSuccess(prompt)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiAuth()
    const { id } = await params

    const existing = await prisma.prompt.findUnique({ where: { id } })
    if (!existing) {
      return apiError("Prompt not found", 404)
    }

    if (existing.userId !== user.id && user.role !== "ADMIN") {
      return apiError("Forbidden", 403)
    }

    await prisma.prompt.delete({ where: { id } })

    return apiSuccess({ deleted: true })
  } catch (error) {
    return handleApiError(error)
  }
}

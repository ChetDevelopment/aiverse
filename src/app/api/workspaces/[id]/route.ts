import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, apiSuccess, handleApiError, requireApiAuth } from "@/lib/api-utils"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiAuth()
    const { id } = await params

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { order: "asc" },
          include: {
            tool: {
              select: {
                id: true,
                name: true,
                slug: true,
                tagline: true,
                logo: true,
                pricing: true,
                isOpenSource: true,
                viewCount: true,
                categories: { include: { category: true } },
                reviews: { select: { rating: true } },
              },
            },
            prompt: true,
            collection: true,
          },
        },
        _count: { select: { items: true } },
      },
    })

    if (!workspace) return apiError("Workspace not found", 404)
    if (workspace.userId !== user.id && !workspace.isPublic) {
      return apiError("Forbidden", 403)
    }

    return apiSuccess({ data: workspace })
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

    const existing = await prisma.workspace.findUnique({ where: { id } })
    if (!existing) return apiError("Workspace not found", 404)
    if (existing.userId !== user.id) return apiError("Forbidden", 403)

    const body = await request.json()
    const { name, description, emoji, isPublic, archived } = body

    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = name.trim()
    if (description !== undefined) data.description = description
    if (emoji !== undefined) data.emoji = emoji
    if (isPublic !== undefined) data.isPublic = isPublic
    if (archived !== undefined) data.archived = archived

    const workspace = await prisma.workspace.update({
      where: { id },
      data,
      include: { _count: { select: { items: true } } },
    })

    return apiSuccess(workspace)
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

    const existing = await prisma.workspace.findUnique({ where: { id } })
    if (!existing) return apiError("Workspace not found", 404)
    if (existing.userId !== user.id) return apiError("Forbidden", 403)

    await prisma.workspace.delete({ where: { id } })

    return apiSuccess({ deleted: true })
  } catch (error) {
    return handleApiError(error)
  }
}

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, apiSuccess, handleApiError, requireApiAuth } from "@/lib/api-utils"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const user = await requireApiAuth()
    const { id, itemId } = await params

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      select: { userId: true },
    })
    if (!workspace) return apiError("Workspace not found", 404)
    if (workspace.userId !== user.id) return apiError("Forbidden", 403)

    const item = await prisma.workspaceItem.findUnique({
      where: { id: itemId },
    })
    if (!item || item.workspaceId !== id) {
      return apiError("Item not found", 404)
    }

    const body = await request.json()
    const { note, order, workflow } = body

    const data: Record<string, unknown> = {}
    if (note !== undefined) data.note = note
    if (order !== undefined) data.order = order
    if (workflow !== undefined) data.workflow = workflow

    const updated = await prisma.workspaceItem.update({
      where: { id: itemId },
      data,
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
    })

    return apiSuccess(updated)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const user = await requireApiAuth()
    const { id, itemId } = await params

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      select: { userId: true },
    })
    if (!workspace) return apiError("Workspace not found", 404)
    if (workspace.userId !== user.id) return apiError("Forbidden", 403)

    const item = await prisma.workspaceItem.findUnique({
      where: { id: itemId },
    })
    if (!item || item.workspaceId !== id) {
      return apiError("Item not found", 404)
    }

    await prisma.workspaceItem.delete({ where: { id: itemId } })

    return apiSuccess({ deleted: true })
  } catch (error) {
    return handleApiError(error)
  }
}

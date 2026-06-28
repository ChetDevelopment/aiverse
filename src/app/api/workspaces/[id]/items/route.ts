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
      select: { userId: true, isPublic: true },
    })
    if (!workspace) return apiError("Workspace not found", 404)
    if (workspace.userId !== user.id && !workspace.isPublic) {
      return apiError("Forbidden", 403)
    }

    const items = await prisma.workspaceItem.findMany({
      where: { workspaceId: id },
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
    })

    return apiSuccess(items)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiAuth()
    const { id } = await params

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      select: { userId: true },
    })
    if (!workspace) return apiError("Workspace not found", 404)
    if (workspace.userId !== user.id) return apiError("Forbidden", 403)

    const body = await request.json()
    const { toolId, note, promptId, collectionId, workflow } = body

    if (!toolId && !note && !promptId && !collectionId && !workflow) {
      return apiError("At least one of toolId, note, promptId, collectionId, or workflow is required")
    }

    const maxOrder = await prisma.workspaceItem.aggregate({
      where: { workspaceId: id },
      _max: { order: true },
    })

    const item = await prisma.workspaceItem.create({
      data: {
        workspaceId: id,
        toolId: toolId || null,
        note: note || null,
        promptId: promptId || null,
        collectionId: collectionId || null,
        workflow: workflow || null,
        order: (maxOrder._max.order ?? -1) + 1,
      },
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

    return apiSuccess(item, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

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

    const original = await prisma.workspace.findUnique({
      where: { id },
      include: { items: true },
    })
    if (!original) return apiError("Workspace not found", 404)
    if (original.userId !== user.id && !original.isPublic) {
      return apiError("Forbidden", 403)
    }

    const duplicate = await prisma.workspace.create({
      data: {
        name: `${original.name} (Copy)`,
        description: original.description,
        emoji: original.emoji,
        userId: user.id,
        isPublic: false,
        archived: false,
        items: {
          create: original.items.map((item) => ({
            toolId: item.toolId,
            note: item.note,
            promptId: item.promptId,
            collectionId: item.collectionId,
            workflow: item.workflow,
            order: item.order,
          })),
        },
      },
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

    return apiSuccess(duplicate, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

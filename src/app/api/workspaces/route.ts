import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, apiSuccess, handleApiError, requireApiAuth } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiAuth()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const archived = searchParams.get("archived")

    const where: Record<string, unknown> = { userId: user.id }

    if (archived === "true") {
      where.archived = true
    } else if (archived !== "all") {
      where.archived = false
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const workspaces = await prisma.workspace.findMany({
      where,
      include: { _count: { select: { items: true } } },
      orderBy: [{ archived: "asc" }, { updatedAt: "desc" }],
    })

    return apiSuccess({ data: workspaces })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiAuth()
    const body = await request.json()
    const { name, description, emoji } = body

    if (!name?.trim()) {
      return apiError("Name is required")
    }

    const workspace = await prisma.workspace.create({
      data: {
        name: name.trim(),
        description: description || null,
        emoji: emoji || "💼",
        userId: user.id,
      },
      include: { _count: { select: { items: true } } },
    })

    return apiSuccess(workspace, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

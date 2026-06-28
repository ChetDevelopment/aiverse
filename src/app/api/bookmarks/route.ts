import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { apiError, apiSuccess } from "@/lib/api-utils"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError("Unauthorized", 401)

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    include: {
      tool: {
        select: {
          id: true, name: true, slug: true, tagline: true, logo: true, pricing: true,
          categories: { include: { category: { select: { name: true, slug: true } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return apiSuccess(bookmarks)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError("Unauthorized", 401)

  try {
    const { toolId } = await request.json()
    if (!toolId || typeof toolId !== "string") return apiError("toolId is required", 400)
    await prisma.bookmark.upsert({
      where: { userId_toolId: { userId: user.id, toolId } },
      update: {},
      create: { userId: user.id, toolId },
    })
    return apiSuccess({ bookmarked: true })
  } catch {
    return apiError("Failed to bookmark", 500)
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError("Unauthorized", 401)

  try {
    const { toolId } = await request.json()
    if (!toolId || typeof toolId !== "string") return apiError("toolId is required", 400)
    await prisma.bookmark.deleteMany({ where: { userId: user.id, toolId } })
    return apiSuccess({ bookmarked: false })
  } catch {
    return apiError("Failed to remove bookmark", 500)
  }
}

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { apiError, apiSuccess } from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return apiError("Unauthorized", 401)
  }

  try {
    const { toolId } = await request.json()
    if (!toolId || typeof toolId !== "string") return apiError("toolId is required", 400)

    await prisma.favorite.upsert({
      where: { userId_toolId: { userId: user.id, toolId } },
      update: {},
      create: { userId: user.id, toolId },
    })

    return apiSuccess({ favorited: true })
  } catch {
    return apiError("Failed to toggle favorite", 500)
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return apiError("Unauthorized", 401)
  }

  try {
    const { toolId } = await request.json()
    if (!toolId || typeof toolId !== "string") return apiError("toolId is required", 400)

    await prisma.favorite.deleteMany({
      where: { userId: user.id, toolId },
    })

    return apiSuccess({ favorited: false })
  } catch {
    return apiError("Failed to remove favorite", 500)
  }
}

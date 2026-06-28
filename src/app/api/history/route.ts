import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { apiError, apiSuccess } from "@/lib/api-utils"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiSuccess([])

  const history = await prisma.history.findMany({
    where: { userId: user.id },
    include: {
      tool: {
        select: {
          id: true, name: true, slug: true, tagline: true, logo: true, pricing: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return apiSuccess(history)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError("Unauthorized", 401)

  try {
    const { toolId } = await request.json()
    await prisma.history.create({ data: { userId: user.id, toolId } })
    return apiSuccess({ success: true })
  } catch {
    return apiError("Failed to record history", 500)
  }
}

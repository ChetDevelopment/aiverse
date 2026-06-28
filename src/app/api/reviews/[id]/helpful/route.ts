import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { apiError, apiSuccess } from "@/lib/api-utils"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError("Unauthorized", 401)

  const { id } = await params
  const { helpful } = await request.json()

  try {
    await prisma.helpfulVote.upsert({
      where: { reviewId_userId: { reviewId: id, userId: user.id } },
      update: { helpful },
      create: { reviewId: id, userId: user.id, helpful },
    })
    return apiSuccess({ success: true })
  } catch {
    return apiError("Failed to vote", 500)
  }
}

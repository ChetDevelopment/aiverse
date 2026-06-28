import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { reviewSchema } from "@/lib/validations"
import { createClient } from "@/lib/supabase/server"
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit"
import { apiError, apiSuccess } from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = rateLimit(`review:${ip}`, 10, 60000)
  if (!allowed) return rateLimitResponse()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return apiError("Unauthorized", 401)
  }

  try {
    const body = await request.json()
    const { toolId } = body as { toolId?: string }
    if (!toolId || typeof toolId !== "string") {
      return apiError("toolId is required", 400)
    }

    const parsed = reviewSchema.safeParse(body)
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message)
    }

    const { rating, comment } = parsed.data

    const review = await prisma.review.upsert({
      where: { userId_toolId: { userId: user.id, toolId } },
      update: { rating, comment },
      create: { userId: user.id, toolId, rating, comment },
    })

    return apiSuccess(review, 201)
  } catch {
    return apiError("Failed to submit review", 500)
  }
}

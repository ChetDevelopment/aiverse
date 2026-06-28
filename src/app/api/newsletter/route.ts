import { prisma } from "@/lib/prisma"
import { newsletterSchema } from "@/lib/validations"
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit"
import { apiError, apiSuccess } from "@/lib/api-utils"

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = rateLimit(`newsletter:${ip}`, 3, 60000)
  if (!allowed) return rateLimitResponse()

  try {
    const body = await request.json()
    const parsed = newsletterSchema.safeParse(body)
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message)
    }

    await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data.email },
      update: { active: true },
      create: { email: parsed.data.email },
    })

    return apiSuccess({ message: "Successfully subscribed" }, 201)
  } catch {
    return apiError("Failed to subscribe", 500)
  }
}

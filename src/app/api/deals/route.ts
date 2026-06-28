import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, apiSuccess, handleApiError, requireApiAdmin } from "@/lib/api-utils"
import { z } from "zod"

const dealSchema = z.object({
  toolName: z.string().min(2).max(200),
  toolSlug: z.string().min(2).max(200),
  description: z.string().min(10).max(1000),
  dealType: z.enum(["free-tier", "promo-code", "lifetime-deal", "open-source", "student"]),
  promoCode: z.string().optional(),
  promoUrl: z.string().url().optional(),
  link: z.string().url(),
  toolId: z.string().optional(),
})

export async function GET() {
  const deals = await prisma.freeDeal.findMany({
    orderBy: { createdAt: "desc" },
    include: { tool: { select: { name: true, slug: true, logo: true } } },
  })
  return apiSuccess({ data: deals })
}

export async function POST(request: NextRequest) {
  try {
    await requireApiAdmin()
    const body = await request.json()
    const parsed = dealSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues.map((e) => e.message).join(", "))
    const deal = await prisma.freeDeal.create({ data: parsed.data })
    return apiSuccess(deal, 201)
  } catch (error) { return handleApiError(error) }
}

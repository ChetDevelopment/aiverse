import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiSuccess } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") || ""

  if (q.length < 2) return apiSuccess([])

  const tools = await prisma.aiTool.findMany({
    where: {
      isPublished: true,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { tagline: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { name: true, slug: true, tagline: true, pricing: true },
    take: 6,
    orderBy: { viewCount: "desc" },
  })

  const categories = await prisma.category.findMany({
    where: { name: { contains: q, mode: "insensitive" } },
    select: { name: true, slug: true },
    take: 3,
  })

  return apiSuccess({ tools, categories })
}

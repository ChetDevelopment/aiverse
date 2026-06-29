import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiSuccess } from "@/lib/api-utils"
import { Prisma } from "@prisma/client"

export const maxDuration = 30

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50)
  const category = searchParams.get("category") || ""
  const search = searchParams.get("q") || ""
  const sort = searchParams.get("sort") || "stars"

  const where: Prisma.DiscoveredProjectWhereInput = { status: "APPROVED" }

  if (category) where.category = category

  if (search) {
    where.OR = [
      { repoName: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { topics: { contains: search, mode: "insensitive" } },
    ]
  }

  const orderBy: Prisma.DiscoveredProjectOrderByWithRelationInput =
    sort === "updated" ? { lastPushAt: "desc" } :
    sort === "newest" ? { discoveredAt: "desc" } :
    { stars: "desc" }

  const [items, total] = await Promise.all([
    prisma.discoveredProject.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
    prisma.discoveredProject.count({ where }),
  ])

  // Get category counts
  const categoryCounts = await prisma.discoveredProject.groupBy({
    by: ["category"],
    where: { status: "APPROVED" },
    _count: true,
  })

  const categories: Record<string, number> = {}
  for (const c of categoryCounts) {
    if (c.category) categories[c.category] = c._count
  }

  return apiSuccess({
    items,
    total,
    page,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
    categories,
  })
}

import { prisma } from "@/lib/prisma"
import { apiSuccess } from "@/lib/api-utils"

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { tools: true } } },
  })

  return apiSuccess({ data: categories })
}

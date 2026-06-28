import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, apiSuccess, handleApiError } from "@/lib/api-utils"

export const dynamic = "force-dynamic"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const path = await prisma.learningPath.findUnique({
      where: { slug, published: true },
    })

    if (!path) {
      return apiError("Learning path not found", 404)
    }

    const related = await prisma.learningPath.findMany({
      where: {
        published: true,
        category: path.category,
        id: { not: path.id },
      },
      take: 3,
      orderBy: { createdAt: "desc" },
    })

    return apiSuccess({ path, related })
  } catch (error) {
    return handleApiError(error)
  }
}

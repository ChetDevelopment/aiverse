import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, apiSuccess, handleApiError, requireApiAdmin } from "@/lib/api-utils"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const paths = await prisma.learningPath.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    })

    const grouped: Record<string, typeof paths> = {}
    for (const path of paths) {
      const cat = path.category || "Uncategorized"
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(path)
    }

    return apiSuccess({
      paths,
      grouped,
      categories: Object.keys(grouped).sort(),
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiAdmin()

    const body = await request.json()
    const { title, slug, description, icon, difficulty, category, steps, published } = body

    if (!title || !slug) {
      return apiError("Title and slug are required", 400)
    }

    const existing = await prisma.learningPath.findUnique({ where: { slug } })
    if (existing) {
      return apiError("A learning path with this slug already exists", 409)
    }

    const path = await prisma.learningPath.create({
      data: {
        title,
        slug,
        description: description || null,
        icon: icon || null,
        difficulty: difficulty || "beginner",
        category: category || null,
        steps: steps || [],
        published: published || false,
      },
    })

    return apiSuccess(path, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

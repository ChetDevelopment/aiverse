import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { toolSchema } from "@/lib/validations"
import { apiError, apiSuccess, requireApiAdmin, handleApiError } from "@/lib/api-utils"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const tool = await prisma.aiTool.findUnique({
    where: { slug, isPublished: true },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      pros: true,
      cons: true,
      screenshots: { orderBy: { order: "asc" } },
      reviews: {
        include: { user: { select: { name: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
      },
      faqs: { orderBy: { order: "asc" } },
      alternatives: {
        include: {
          alternative: {
            select: { id: true, name: true, slug: true, tagline: true, logo: true, pricing: true, reviews: { select: { rating: true } } },
          },
        },
      },
      _count: { select: { favorites: true, bookmarks: true } },
    },
  })

  if (!tool) return apiError("Tool not found", 404)

  await prisma.aiTool.update({
    where: { id: tool.id },
    data: { viewCount: { increment: 1 } },
  })

  return apiSuccess(tool)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requireApiAdmin()
    const { slug } = await params
    const existing = await prisma.aiTool.findUnique({ where: { slug } })
    if (!existing) return apiError("Tool not found", 404)

    const body = await request.json()
    const parsed = toolSchema.safeParse(body)
    if (!parsed.success) {
      return apiError(parsed.error.issues.map((e) => e.message).join(", "))
    }

    const { categoryIds, tagIds, pros, cons, screenshots, faqs, ...toolData } = parsed.data

    await prisma.aiTool.update({
      where: { id: existing.id },
      data: {
        ...toolData,
        categories: {
          deleteMany: {},
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
        tags: tagIds ? { deleteMany: {}, create: tagIds.map((tagId) => ({ tagId })) } : undefined,
        pros: pros ? { deleteMany: {}, create: pros.map((p) => ({ text: p.text })) } : undefined,
        cons: cons ? { deleteMany: {}, create: cons.map((c) => ({ text: c.text })) } : undefined,
        screenshots: screenshots ? { deleteMany: {}, create: screenshots.map((s, i) => ({ url: s.url, alt: s.alt, order: i })) } : undefined,
        faqs: faqs ? { deleteMany: {}, create: faqs.map((f, i) => ({ question: f.question, answer: f.answer, order: i })) } : undefined,
      },
    })

    return apiSuccess({ updated: true })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requireApiAdmin()
    const { slug } = await params
    await prisma.aiTool.delete({ where: { slug } })
    return apiSuccess({ deleted: true })
  } catch (error) {
    return handleApiError(error)
  }
}

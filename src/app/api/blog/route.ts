import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, apiSuccess, handleApiError, requireApiAdmin } from "@/lib/api-utils"
import { z } from "zod"

const blogSchema = z.object({
  title: z.string().min(5).max(200),
  slug: z.string().min(3).max(200),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(50),
  coverImage: z.string().url().optional(),
  author: z.string().min(2).max(100),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  readTime: z.number().int().positive().optional(),
  tags: z.string().optional(),
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50)
  const publishedOnly = searchParams.get("published") !== "false"

  const where = publishedOnly ? { published: true } : {}

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.blogPost.count({ where }),
  ])

  return apiSuccess({
    items: posts,
    total,
    page,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  })
}

export async function POST(request: Request) {
  try {
    await requireApiAdmin()
    const body = await request.json()
    const parsed = blogSchema.safeParse(body)
    if (!parsed.success) {
      return apiError(parsed.error.issues.map((e) => e.message).join(", "))
    }
    const post = await prisma.blogPost.create({ data: parsed.data })
    return apiSuccess(post, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({ where: { slug } })
  if (!post || !post.published) return apiError("Post not found", 404)
  return apiSuccess(post)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requireApiAdmin()
    const { slug } = await params
    const body = await request.json()
    const parsed = blogSchema.partial().safeParse(body)
    if (!parsed.success) {
      return apiError(parsed.error.issues.map((e) => e.message).join(", "))
    }
    const post = await prisma.blogPost.update({ where: { slug }, data: parsed.data })
    return apiSuccess(post)
  } catch (error) {
    return handleApiError(error)
  }
}

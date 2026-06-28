import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import type { Prisma, PricingModel } from "@prisma/client"
import { toolSchema } from "@/lib/validations"
import { apiError, apiSuccess, handleApiError, requireApiAdmin } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const category = searchParams.get("category")
  const pricing = searchParams.get("pricing")
  const sort = searchParams.get("sort") || "popular"
  const page = parseInt(searchParams.get("page") || "1")
  const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50)
  const githubFallback = searchParams.get("github") !== "false"

  const where: Prisma.AiToolWhereInput = { isPublished: true }

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { tagline: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ]
  }

  if (category) {
    where.categories = { some: { category: { slug: category } } }
  }

  if (pricing) {
    where.pricing = pricing.toUpperCase() as PricingModel
  }

  const orderBy: Prisma.AiToolOrderByWithRelationInput =
    sort === "newest" ? { createdAt: "desc" } :
    sort === "popular" ? { viewCount: "desc" } :
    { featuredScore: "desc" }

  const [items, total] = await Promise.all([
    prisma.aiTool.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit, include: { categories: { include: { category: true } }, reviews: { select: { rating: true } } } }),
    prisma.aiTool.count({ where }),
  ])

  // If no local results and query exists, try GitHub API fallback
  let githubResults: any[] = []
  let fromGitHub = false

  if (items.length === 0 && query && githubFallback) {
    fromGitHub = true
    const token = process.env.GITHUB_TOKEN
    if (token) {
      try {
        const res = await fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}+AI&per_page=${limit}&sort=stars`,
          { headers: { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "User-Agent": "AIVerse/1.0" } }
        )
        if (res.ok) {
          const data = await res.json()
          githubResults = ((data.items || []) as Record<string, unknown>[]).map((repo: Record<string, unknown>) => {
            const owner = repo.owner as Record<string, unknown> | null
            return {
              id: `gh_${repo.id}`,
              name: repo.name as string,
              slug: repo.full_name as string,
              fullName: repo.full_name as string,
              tagline: (repo.description as string) || "No description",
              description: (repo.description as string) || "",
              logo: (owner?.avatar_url as string) || null,
              websiteUrl: repo.html_url as string,
              pricing: "FREE",
              viewCount: (repo.stargazers_count as number) || 0,
              stars: repo.stargazers_count,
              forks: repo.forks_count,
              language: repo.language,
              topics: (repo.topics as string[]) || [],
              fromGitHub: true,
              categories: [],
              reviews: [],
            }
          })
        }
      } catch (error) {
        console.error("[API_TOOLS] GitHub fallback", error)
      }
    }
  }

  return apiSuccess({
    items: githubResults.length > 0 ? githubResults : items,
    total: githubResults.length > 0 ? githubResults.length : total,
    page,
    pageSize: limit,
    totalPages: Math.ceil((githubResults.length > 0 ? githubResults.length : total) / limit),
    fromGitHub,
    query,
  })
}

export async function POST(request: Request) {
  try {
    await requireApiAdmin()
    const body = await request.json()
    const parsed = toolSchema.safeParse(body)
    if (!parsed.success) {
      return apiError(parsed.error.issues.map((e) => e.message).join(", "))
    }
    const { categoryIds, tagIds, pros, cons, screenshots, faqs, ...toolData } = parsed.data
    const tool = await prisma.aiTool.create({
      data: {
        ...toolData,
        categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
        tags: tagIds ? { create: tagIds.map((tagId) => ({ tagId })) } : undefined,
        pros: pros ? { create: pros.map((p) => ({ text: p.text })) } : undefined,
        cons: cons ? { create: cons.map((c) => ({ text: c.text })) } : undefined,
        screenshots: screenshots ? { create: screenshots.map((s, i) => ({ url: s.url, alt: s.alt, order: i })) } : undefined,
        faqs: faqs ? { create: faqs.map((f, i) => ({ question: f.question, answer: f.answer, order: i })) } : undefined,
      },
    })
    return apiSuccess(tool, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

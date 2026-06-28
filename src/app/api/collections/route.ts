import { prisma } from "@/lib/prisma"
import { apiSuccess } from "@/lib/api-utils"

export async function GET() {

  const collections = [
    {
      id: "free-tools",
      name: "Best Free AI Tools",
      description: "Powerful AI tools that won't cost you a thing",
      icon: "free",
      tools: await prisma.aiTool.findMany({
        where: { isPublished: true, pricing: "FREE" },
        take: 10,
        orderBy: { viewCount: "desc" },
        select: { id: true, name: true, slug: true, tagline: true },
      }),
    },
    {
      id: "trending",
      name: "Trending AI Tools",
      description: "Most popular AI tools right now",
      icon: "trending",
      tools: await prisma.aiTool.findMany({
        where: { isPublished: true },
        take: 10,
        orderBy: { viewCount: "desc" },
        select: { id: true, name: true, slug: true, tagline: true },
      }),
    },
    {
      id: "new",
      name: "New AI Tools",
      description: "Latest additions to our directory",
      icon: "new",
      tools: await prisma.aiTool.findMany({
        where: { isPublished: true },
        take: 10,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, slug: true, tagline: true },
      }),
    },
  ]

  return apiSuccess(collections)
}

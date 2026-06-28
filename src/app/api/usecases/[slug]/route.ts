import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, apiSuccess, handleApiError } from "@/lib/api-utils"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const useCase = await prisma.useCase.findUnique({
    where: { slug },
    include: {
      tools: {
        include: {
          tool: {
            include: {
              categories: { include: { category: true } },
              reviews: { select: { rating: true } },
            },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  })

  if (!useCase) return apiError("Use case not found", 404)

  return apiSuccess(useCase)
}

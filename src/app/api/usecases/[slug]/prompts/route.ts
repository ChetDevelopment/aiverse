import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiSuccess, handleApiError } from "@/lib/api-utils"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const useCase = await prisma.useCase.findUnique({
      where: { slug },
      select: { tools: { select: { toolId: true } } },
    })
    if (!useCase) return apiSuccess({ prompts: [] })

    const toolIds = useCase.tools.map((t) => t.toolId)
    const prompts = await prisma.prompt.findMany({
      where: { toolId: { in: toolIds }, isOfficial: true },
      include: { tool: { select: { name: true, slug: true } } },
      take: 10,
    })
    return apiSuccess({ prompts })
  } catch (error) {
    return handleApiError(error)
  }
}

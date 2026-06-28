import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, apiSuccess, handleApiError } from "@/lib/api-utils"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const prompt = await prisma.prompt.findUnique({ where: { id } })
    if (!prompt) {
      return apiError("Prompt not found", 404)
    }

    const updated = await prisma.prompt.update({
      where: { id },
      data: { useCount: { increment: 1 } },
    })

    return apiSuccess(updated)
  } catch (error) {
    return handleApiError(error)
  }
}

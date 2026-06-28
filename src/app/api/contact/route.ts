import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiSuccess, apiError, getIPAddress } from "@/lib/api-utils"
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const ip = getIPAddress(request)
  const { allowed } = rateLimit(`contact:${ip}`, 3, 60000)
  if (!allowed) return rateLimitResponse()

  try {
    const { name, email, message } = await request.json()
    if (!name || !email || !message) return apiError("All fields required")

    await prisma.contactMessage.create({ data: { name, email, message } })

    return apiSuccess({ message: "Message received" }, 201)
  } catch {
    return apiError("Invalid request", 400)
  }
}

export async function GET() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  })
  return apiSuccess(messages)
}

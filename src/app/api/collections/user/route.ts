import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { apiError, apiSuccess } from "@/lib/api-utils"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError("Unauthorized", 401)

  const collections = await prisma.collection.findMany({
    where: { userId: user.id },
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  })

  return apiSuccess(collections)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError("Unauthorized", 401)

  try {
    const { name, description, icon } = await request.json()
    const slug = name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")

    const collection = await prisma.collection.create({
      data: { name, slug, description, icon, userId: user.id },
    })

    return apiSuccess(collection, 201)
  } catch {
    return apiError("Failed to create collection", 500)
  }
}

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { apiError, apiSuccess } from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError("Unauthorized", 401)

  try {
    const { id, all } = await request.json()
    if (all) {
      await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
      })
    } else if (id) {
      await prisma.notification.update({
        where: { id },
        data: { read: true },
      })
    }
    return apiSuccess({ success: true })
  } catch {
    return apiError("Failed to mark as read", 500)
  }
}

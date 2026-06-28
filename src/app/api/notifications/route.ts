import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { apiError, apiSuccess } from "@/lib/api-utils"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiSuccess({ items: [], unreadCount: 0 })

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, read: false },
  })

  return apiSuccess({ items: notifications, unreadCount })
}

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/lib/validations"
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit"
import { apiError } from "@/lib/api-utils"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = rateLimit(`register:${ip}`, 3, 60000)
  if (!allowed) return rateLimitResponse()

  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message)
    }

    const supabase = await createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { data: { name: parsed.data.name } },
    })

    const existingUserCount = await prisma.user.count()
    const isFirstUser = existingUserCount === 0
    const passwordHash = await bcrypt.hash(parsed.data.password, 10)

    const userData = {
      name: parsed.data.name,
      passwordHash,
      ...(isFirstUser ? { role: "ADMIN" as const } : {}),
    }

    if (authData.user && !authError) {
      await prisma.user.upsert({
        where: { email: parsed.data.email },
        update: userData,
        create: { id: authData.user.id, email: parsed.data.email, ...userData },
      })
    } else {
      await prisma.user.upsert({
        where: { email: parsed.data.email },
        update: userData,
        create: { email: parsed.data.email, ...userData },
      })
    }

    return NextResponse.json({ success: true, local: !!authError })
  } catch {
    return apiError("Invalid request", 400)
  }
}

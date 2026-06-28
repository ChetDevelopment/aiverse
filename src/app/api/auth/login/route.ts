import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { loginSchema } from "@/lib/validations"
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit"
import { apiError } from "@/lib/api-utils"
import { syncOAuthUser } from "@/lib/auth-helpers"
import bcrypt from "bcryptjs"

const LOCAL_AUTH_COOKIE = "aiverse_local_session"

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = rateLimit(`login:${ip}`, 5, 60000)
  if (!allowed) return rateLimitResponse()

  const body = await request.json().catch(() => ({}))
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(parsed.error.issues[0].message)
  }

  const { email, password } = parsed.data

  // Try Supabase auth (may fail if Supabase is not configured)
  let supabaseSuccess = false
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    supabaseSuccess = !error
  } catch {
    // Supabase unavailable — will try local auth
  }

  if (supabaseSuccess) {
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) await syncOAuthUser(user)
    } catch (error) {
      console.error("[API_AUTH_LOGIN] Sync OAuth user", error)
    }
    return NextResponse.json({ success: true, redirect: "/admin" })
  }

  // Local auth fallback (works without Supabase)
  const user = await prisma.user.findUnique({ where: { email } })
  if (user?.passwordHash) {
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (valid) {
      const session = Buffer.from(
        JSON.stringify({ id: user.id, email: user.email, role: user.role })
      ).toString("base64")
      const cookie = `${LOCAL_AUTH_COOKIE}=${session}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
      return new Response(JSON.stringify({ success: true, redirect: "/admin" }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Set-Cookie": cookie },
      })
    }
  }

  return apiError("Invalid email or password", 401)
}

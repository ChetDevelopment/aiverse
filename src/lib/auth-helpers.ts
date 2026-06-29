import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

const SESSION_COOKIES = ["aiverse_local_session", "aiverse_google_session", "aiverse_github_session"]

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user: supabaseUser } } = await supabase.auth.getUser()
  if (supabaseUser) {
    const dbUser = await prisma.user.findUnique({
      where: { id: supabaseUser.id },
      select: { id: true, email: true, name: true, avatarUrl: true, role: true },
    })
    return dbUser
  }

  try {
    const cookieStore = await cookies()
    for (const name of SESSION_COOKIES) {
      const session = cookieStore.get(name)
      if (session?.value) {
        const data = JSON.parse(Buffer.from(session.value, "base64").toString())
        if (data.email) {
          return {
            id: data.id,
            email: data.email,
            name: data.name || null,
            avatarUrl: data.avatarUrl || null,
            role: data.role || "USER",
          }
        }
      }
    }
  } catch {}

  return null
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  return user
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "ADMIN") redirect("/")
  return user
}

export async function syncOAuthUser(supabaseUser: {
  id: string
  email?: string | null
  user_metadata?: { name?: string; avatar_url?: string; full_name?: string }
}) {
  const existingUser = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
  })

  if (existingUser) return existingUser

  return prisma.user.create({
    data: {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      name:
        supabaseUser.user_metadata?.name ||
        supabaseUser.user_metadata?.full_name ||
        null,
      avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
    },
  })
}

export async function syncUserOnCallback() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await syncOAuthUser(user)
  }
}

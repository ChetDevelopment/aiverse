import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

const LOCAL_AUTH_COOKIE = "aiverse_local_session"

export async function GET() {
  // Try Supabase first
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split("@")[0],
        avatarUrl: user.user_metadata?.avatar_url,
      },
    })
  }

  // Fallback: check local auth cookie
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get(LOCAL_AUTH_COOKIE)
    if (session?.value) {
      const data = JSON.parse(Buffer.from(session.value, "base64").toString())
      if (data.email) {
        return NextResponse.json({
          user: {
            id: data.id,
            email: data.email,
            name: data.email?.split("@")[0],
            role: data.role,
          },
        })
      }
    }
  } catch (error) {
    console.error("[API_AUTH_USER] Cookie parse", error)
  }

  return NextResponse.json({ user: null })
}

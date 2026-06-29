import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const SESSION_COOKIES = ["aiverse_local_session", "aiverse_google_session", "aiverse_github_session"]

function parseSessionCookie(value: string) {
  try {
    return JSON.parse(Buffer.from(value, "base64").toString()) as {
      id: string; email: string; name?: string; role?: string; avatarUrl?: string
    }
  } catch { return null }
}

export async function GET(request: NextRequest) {
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

  // Fallback: check custom session cookies via request cookies
  for (const name of SESSION_COOKIES) {
    const session = request.cookies.get(name)
    if (session?.value) {
      const data = parseSessionCookie(session.value)
      if (data?.email) {
        return NextResponse.json({
          user: {
            id: data.id,
            email: data.email,
            name: data.name || data.email?.split("@")[0],
            avatarUrl: data.avatarUrl || null,
            role: data.role,
          },
        })
      }
    }
  }

  return NextResponse.json({ user: null })
}

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const COOKIES_TO_CLEAR = ["aiverse_local_session", "aiverse_google_session", "aiverse_github_session"]

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch {}

  const response = NextResponse.redirect(new URL("/", request.url))
  for (const name of COOKIES_TO_CLEAR) {
    response.cookies.set(name, "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    })
  }
  return response
}

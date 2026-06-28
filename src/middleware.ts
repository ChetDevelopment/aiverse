import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

const LOCAL_AUTH_COOKIE = "aiverse_local_session"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Check local auth session for admin access
  let isLocalAdmin = false
  if (!user) {
    const sessionCookie = request.cookies.get(LOCAL_AUTH_COOKIE)
    if (sessionCookie?.value) {
      try {
        const data = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString())
        isLocalAdmin = data.role === "ADMIN"
      } catch {}
    }
  }

  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/api/admin") &&
    pathname !== "/login"
  ) {
    if (!user && !isLocalAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

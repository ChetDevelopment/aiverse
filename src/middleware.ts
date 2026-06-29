import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

const LOCAL_AUTH_COOKIE = "aiverse_local_session"

// In-memory rate limit map (edge-compatible)
const rateMap = new Map<string, { count: number; resetAt: number }>()

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return request.headers.get("x-real-ip") || "127.0.0.1"
}

function checkGlobalRateLimit(ip: string): { allowed: boolean; retryAfter: string } {
  const now = Date.now()
  const key = `global:${ip}`
  const record = rateMap.get(key)

  // Allow 120 requests per minute per IP at the edge level
  const MAX_RPM = 120
  const WINDOW_MS = 60000

  if (!record || now > record.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, retryAfter: "" }
  }

  record.count++

  if (record.count > MAX_RPM) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000)
    return { allowed: false, retryAfter: String(retryAfter) }
  }

  return { allowed: true, retryAfter: "" }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Apply global rate limiting to ALL requests
  const ip = getClientIP(request)
  const rateCheck = checkGlobalRateLimit(ip)

  if (!rateCheck.allowed && !pathname.startsWith("/_next")) {
    // Block excessive requests with 429
    return new NextResponse(
      JSON.stringify({ error: "Too many requests" }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": rateCheck.retryAfter,
          "X-RateLimit-Reset": rateCheck.retryAfter,
        },
      }
    )
  }

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

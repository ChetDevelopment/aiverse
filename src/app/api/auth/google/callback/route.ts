import { NextRequest, NextResponse } from "next/server"
import { exchangeGoogleCode, getGoogleUser } from "@/lib/google-auth"
import { prisma } from "@/lib/prisma"

const ADMIN_EMAILS = ["vichet.sat@student.passerellesnumeriques.org"]

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const next = searchParams.get("next") ?? "/"

  if (error || !code) {
    return NextResponse.redirect(`${origin}/login?error=google_auth_failed`)
  }

  try {
    const tokens = await exchangeGoogleCode(code, origin)
    const googleUser = await getGoogleUser(tokens.access_token)

    const email = googleUser.email
    if (!email) {
      return NextResponse.redirect(`${origin}/login?error=no_email`)
    }

    const role = ADMIN_EMAILS.includes(email) ? "ADMIN" : "USER"
    let user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: googleUser.name || email.split("@")[0],
          avatarUrl: googleUser.picture || null,
          role,
        },
      })
    } else {
      const updates: Record<string, unknown> = {}
      if (googleUser.picture && !user.avatarUrl) updates.avatarUrl = googleUser.picture
      if (user.role !== role) updates.role = role
      if (Object.keys(updates).length > 0) {
        await prisma.user.update({ where: { id: user.id }, data: updates })
      }
    }

    const session = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
    }
    const encoded = Buffer.from(JSON.stringify(session)).toString("base64")
    const target = `${origin}${next}`
    const cookie = `aiverse_google_session=${encoded}; path=/; ${origin.startsWith("https") ? "secure; " : ""}samesite=lax; max-age=${60*60*24*7}`

    const html = `<!DOCTYPE html><html><body><script>
      document.cookie = "${cookie}";
      window.location.href = "${target}";
    </script></body></html>`

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Set-Cookie": cookie,
      },
    })
  } catch (e) {
    console.error("[GOOGLE_AUTH] Callback error:", e)
    return NextResponse.redirect(`${origin}/login?error=google_auth_failed`)
  }
}

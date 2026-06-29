import { NextRequest, NextResponse } from "next/server"
import { exchangeGoogleCode, getGoogleUser } from "@/lib/google-auth"
import { prisma } from "@/lib/prisma"

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

    let user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: googleUser.name || email.split("@")[0],
          avatarUrl: googleUser.picture || null,
          role: "USER",
        },
      })
    } else if (googleUser.picture && !user.avatarUrl) {
      await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl: googleUser.picture },
      })
    }

    const session = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
    }
    const encoded = Buffer.from(JSON.stringify(session)).toString("base64")
    const isSecure = origin.startsWith("https://")

    const redirectUrl = new URL(`${origin}${next}`)
    redirectUrl.searchParams.set("google_auth", "success")
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set("aiverse_google_session", encoded, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
    return response
  } catch (e) {
    console.error("[GOOGLE_AUTH] Callback error:", e)
    return NextResponse.redirect(`${origin}/login?error=google_auth_failed`)
  }
}

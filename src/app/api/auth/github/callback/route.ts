import { NextRequest, NextResponse } from "next/server"
import { exchangeGithubCode, getGithubUser } from "@/lib/github-auth"
import { prisma } from "@/lib/prisma"

const ADMIN_EMAILS = ["vichet.sat@student.passerellesnumeriques.org"]

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const next = searchParams.get("next") ?? "/"

  if (error || !code) {
    return NextResponse.redirect(`${origin}/login?error=github_auth_failed`)
  }

  try {
    const tokens = await exchangeGithubCode(code, origin)
    const githubUser = await getGithubUser(tokens.access_token)

    const email = githubUser.email
    if (!email) {
      return NextResponse.redirect(`${origin}/login?error=no_email`)
    }

    const role = ADMIN_EMAILS.includes(email) ? "ADMIN" : "USER"
    let user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: githubUser.name || email.split("@")[0],
          avatarUrl: githubUser.picture || null,
          role,
        },
      })
    } else {
      const updates: Record<string, unknown> = {}
      if (githubUser.picture && !user.avatarUrl) updates.avatarUrl = githubUser.picture
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
    const isSecure = origin.startsWith("https://")

    const response = NextResponse.redirect(`${origin}${next}`)
    response.cookies.set("aiverse_github_session", encoded, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
    return response
  } catch (e) {
    console.error("[GITHUB_AUTH] Callback error:", e)
    return NextResponse.redirect(`${origin}/login?error=github_auth_failed`)
  }
}

import { NextRequest, NextResponse } from "next/server"
import { exchangeGithubCode, getGithubUser } from "@/lib/github-auth"
import { prisma } from "@/lib/prisma"

const SESSION_COOKIE = "aiverse_github_session"

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

    let user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: githubUser.name || email.split("@")[0],
          avatarUrl: githubUser.picture || null,
          role: "USER",
        },
      })
    } else if (githubUser.picture && !user.avatarUrl) {
      await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl: githubUser.picture },
      })
    }

    const response = NextResponse.redirect(`${origin}${next}`)
    const session = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
    }
    const encoded = Buffer.from(JSON.stringify(session)).toString("base64")
    response.cookies.set(SESSION_COOKIE, encoded, {
      httpOnly: true,
      secure: true,
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

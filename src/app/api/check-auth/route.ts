import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const cookies = request.cookies.getAll()
  const names = cookies.map(c => c.name)
  const session = request.cookies.get("aiverse_google_session")?.value || null
  const session2 = request.cookies.get("aiverse_github_session")?.value || null
  
  let parsed = null
  if (session) {
    try { parsed = JSON.parse(Buffer.from(session, "base64").toString()) } catch {}
  }
  if (!parsed && session2) {
    try { parsed = JSON.parse(Buffer.from(session2, "base64").toString()) } catch {}
  }

  return NextResponse.json({
    allCookieNames: names,
    hasGoogleSession: !!session,
    hasGithubSession: !!session2,
    parsedSession: parsed,
    userAgent: request.headers.get("user-agent")?.slice(0, 80),
  })
}

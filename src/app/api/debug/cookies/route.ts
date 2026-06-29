import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const store = await cookies()
  const all = store.getAll()
  const names = all.map((c) => c.name)
  const googleSession = store.get("aiverse_google_session")?.value || null
  const githubSession = store.get("aiverse_github_session")?.value || null
  const localSession = store.get("aiverse_local_session")?.value || null

  let googleData = null
  let githubData = null
  let localData = null

  try { if (googleSession) googleData = JSON.parse(Buffer.from(googleSession, "base64").toString()) } catch {}
  try { if (githubSession) githubData = JSON.parse(Buffer.from(githubSession, "base64").toString()) } catch {}
  try { if (localSession) localData = JSON.parse(Buffer.from(localSession, "base64").toString()) } catch {}

  return NextResponse.json({
    cookieNames: names,
    hasGoogleSession: !!googleSession,
    hasGithubSession: !!githubSession,
    hasLocalSession: !!localSession,
    googleData,
    githubData,
    localData,
  })
}

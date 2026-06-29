const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_SUPABASE_AUTH_GOOGLE_CLIENT_ID || ""
const GOOGLE_CLIENT_SECRET = process.env.NEXT_PUBLIC_SUPABASE_AUTH_GOOGLE_CLIENT_SECRET || ""

const SCOPES = ["openid", "email", "profile"].join(" ")

export function getGoogleAuthUrl(origin: string) {
  const redirectUri = `${origin}/api/auth/google/callback`
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export async function exchangeGoogleCode(code: string, origin: string) {
  const redirectUri = `${origin}/api/auth/google/callback`
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Token exchange failed: ${err}`)
  }
  const tokens = await res.json()
  return tokens as { access_token: string; id_token?: string }
}

export async function getGoogleUser(accessToken: string) {
  const res = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
  if (!res.ok) throw new Error("Failed to get user info")
  return res.json() as Promise<{
    id: string
    email: string
    name: string
    picture: string
  }>
}

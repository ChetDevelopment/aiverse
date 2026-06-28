import { createHash, randomBytes } from "crypto"

const CSRF_SECRET = process.env.CSRF_SECRET || randomBytes(32).toString("hex")

export function generateCsrfToken(sessionId: string): string {
  const timestamp = Date.now().toString(36)
  const payload = sessionId + ":" + timestamp
  const hash = createHash("sha256")
    .update(payload + ":" + CSRF_SECRET)
    .digest("hex")
    .slice(0, 16)
  return timestamp + "." + hash
}

export function validateCsrfToken(token: string, sessionId: string): boolean {
  try {
    const [timestamp, hash] = token.split(".")
    if (!timestamp || !hash) return false
    const payload = sessionId + ":" + timestamp
    const expected = createHash("sha256")
      .update(payload + ":" + CSRF_SECRET)
      .digest("hex")
      .slice(0, 16)
    if (hash !== expected) return false
    const age = Date.now() - parseInt(timestamp, 36)
    return age < 3600000
  } catch {
    return false
  }
}

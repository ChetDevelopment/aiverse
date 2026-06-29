// Security utilities for API route protection

const requestLog = new Map<string, { count: number; firstSeen: number; lastSeen: number }>()
const BLOCKED_IPS = new Set<string>()

export function isBlocked(ip: string): boolean {
  return BLOCKED_IPS.has(ip)
}

export function blockIP(ip: string, reason = "suspicious activity") {
  BLOCKED_IPS.add(ip)
  console.warn(`[SECURITY] Blocked IP ${ip}: ${reason}`)
}

export function checkRateLimit(
  ip: string,
  action: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfter: number } {
  const key = `${ip}:${action}`
  const now = Date.now()
  const record = requestLog.get(key)

  if (!record || now - record.firstSeen > windowMs) {
    requestLog.set(key, { count: 1, firstSeen: now, lastSeen: now })
    return { allowed: true, remaining: maxRequests - 1, retryAfter: 0 }
  }

  record.count++
  record.lastSeen = now

  if (record.count > maxRequests) {
    const retryAfter = Math.ceil((record.firstSeen + windowMs - now) / 1000)
    return { allowed: false, remaining: 0, retryAfter }
  }

  return { allowed: true, remaining: maxRequests - record.count, retryAfter: 0 }
}

export const RATE_LIMITS = {
  general: { max: 60, window: 60000 },      // 60 req/min per IP
  auth: { max: 10, window: 60000 },         // 10 req/min per IP
  search: { max: 30, window: 60000 },       // 30 req/min per IP
  write: { max: 20, window: 60000 },         // 20 req/min for writes
  sensitive: { max: 5, window: 60000 },     // 5 req/min for sensitive ops
  heavy: { max: 120, window: 60000 },       // 120 req/min for API
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return request.headers.get("x-real-ip") || "127.0.0.1"
}

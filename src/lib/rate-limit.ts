import { NextResponse } from "next/server"

const rateMap = new Map<string, { count: number; resetTime: number }>()

export type RateLimitConfig = {
  limit: number
  windowMs: number
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  login: { limit: 5, windowMs: 60000 },
  register: { limit: 3, windowMs: 60000 },
  newsletter: { limit: 3, windowMs: 60000 },
  review: { limit: 10, windowMs: 60000 },
  "tool:create": { limit: 20, windowMs: 60000 },
  "tool:update": { limit: 30, windowMs: 60000 },
  api: { limit: 100, windowMs: 60000 },
}

export function rateLimit(
  key: string,
  limit?: number,
  windowMs?: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const config = RATE_LIMITS[key] || { limit: limit || 10, windowMs: windowMs || 60000 }
  const effectiveLimit = limit || config.limit
  const effectiveWindow = windowMs || config.windowMs

  const now = Date.now()
  const record = rateMap.get(key)

  if (!record || now > record.resetTime) {
    const resetTime = now + effectiveWindow
    rateMap.set(key, { count: 1, resetTime })
    return { allowed: true, remaining: effectiveLimit - 1, resetTime }
  }

  if (record.count >= effectiveLimit) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }

  record.count++
  return {
    allowed: true,
    remaining: effectiveLimit - record.count,
    resetTime: record.resetTime,
  }
}

export function rateLimitResponse() {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429 }
  )
}

const adminLog: { action: string; userId: string; timestamp: Date; ip: string }[] = []

export function logAdminAction(
  userId: string,
  action: string,
  ip: string = "unknown"
) {
  adminLog.push({ action, userId, timestamp: new Date(), ip })
  if (adminLog.length > 1000) adminLog.splice(0, 100)
}

export function getAdminLogs() {
  return [...adminLog].reverse()
}

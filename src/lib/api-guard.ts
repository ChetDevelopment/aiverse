import { NextResponse } from "next/server"
import { checkRateLimit, isBlocked, getClientIP, RATE_LIMITS } from "./security"

export type GuardAction = "general" | "auth" | "search" | "write" | "sensitive" | "heavy"

export function guardAPI(
  request: Request,
  action: GuardAction = "general",
  customMax?: number,
  customWindow?: number
): { passed: boolean; response?: NextResponse } {
  const ip = getClientIP(request)

  if (isBlocked(ip)) {
    return {
      passed: false,
      response: NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      ),
    }
  }

  const limits = RATE_LIMITS[action]
  const result = checkRateLimit(
    ip,
    action,
    customMax || limits.max,
    customWindow || limits.window
  )

  if (!result.allowed) {
    return {
      passed: false,
      response: NextResponse.json(
        { error: `Too many requests. Try again in ${result.retryAfter}s` },
        {
          status: 429,
          headers: {
            "Retry-After": String(result.retryAfter),
            "X-RateLimit-Remaining": "0",
          },
        }
      ),
    }
  }

  return { passed: true }
}

export function guardAPIOrThrow(request: Request, action: GuardAction = "general"): void {
  const result = guardAPI(request, action)
  if (!result.passed) {
    throw new Error("Rate limited")
  }
}

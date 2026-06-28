import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { rateLimit, rateLimitResponse, logAdminAction } from "@/lib/rate-limit"

export function apiError(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status })
}

export function getIPAddress(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }
  return "127.0.0.1"
}

export async function requireApiAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new ApiAuthError("Unauthorized")
  }
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser) {
    throw new ApiAuthError("User not found")
  }
  return dbUser
}

export async function requireApiAdmin() {
  const user = await requireApiAuth()
  if (user.role !== "ADMIN") {
    throw new ApiAuthError("Forbidden")
  }
  return user
}

export class ApiAuthError extends Error {
  status: number
  constructor(message: string, status: number = 401) {
    super(message)
    this.status = status
  }
}

export function apiRateLimit(key: string, request: Request) {
  const ip = getIPAddress(request)
  const { allowed } = rateLimit(`${key}:${ip}`)
  if (!allowed) {
    throw new ApiRateLimitError()
  }
}

export class ApiRateLimitError extends Error {
  status = 429
  constructor() {
    super("Too many requests")
  }
}

export async function adminGuard(
  action: string,
  request: Request
): Promise<{ userId: string }> {
  const ip = getIPAddress(request)
  const user = await requireApiAdmin()
  logAdminAction(user.id, action, ip)
  return { userId: user.id }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiAuthError) {
    return apiError(error.message, error.status)
  }
  if (error instanceof ApiRateLimitError) {
    return rateLimitResponse()
  }
  console.error("API Error:", error)
  return apiError("Internal server error", 500)
}

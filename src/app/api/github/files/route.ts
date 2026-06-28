import { NextRequest } from "next/server"
import { apiSuccess, apiError } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fullName = searchParams.get("full_name")
  const path = searchParams.get("path") || ""
  if (!fullName) return apiError("full_name is required")

  const token = process.env.GITHUB_TOKEN
  const headers: Record<string, string> = {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "AIVerse/1.0",
  }

  try {
    const url = `https://api.github.com/repos/${fullName}/contents/${path}`
    const res = await fetch(url, { headers })
    if (!res.ok) return apiError("Failed to fetch", res.status)
    const data = await res.json()

    const files = (Array.isArray(data) ? data : [data]).map((item: Record<string, unknown>) => ({
      name: item.name as string,
      path: item.path as string,
      type: item.type as string,
      size: (item.size as number) || 0,
    }))

    return apiSuccess(files)
  } catch {
    return apiError("Failed to fetch files", 500)
  }
}

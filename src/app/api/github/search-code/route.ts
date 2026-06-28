import { NextRequest } from "next/server"
import { apiSuccess, apiError } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fullName = searchParams.get("full_name")
  const q = searchParams.get("q")
  if (!fullName || !q) return apiError("full_name and q are required")

  const token = process.env.GITHUB_TOKEN
  const headers = { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "User-Agent": "AIVerse/1.0" }

  try {
    const res = await fetch(`https://api.github.com/search/code?q=${encodeURIComponent(q)}+repo:${fullName}&per_page=10`, { headers })
    if (!res.ok) return apiSuccess({ items: [], total: 0 })
    const data = await res.json()
    const items = (data.items || []).map((item: Record<string, unknown>) => ({
      name: item.name, path: item.path, html_url: item.html_url,
      repo: (item.repository as Record<string, unknown>)?.full_name,
      sha: (item.git_url as string)?.split("/")?.pop()?.replace("?ref=main", ""),
    }))
    return apiSuccess({ items, total: data.total_count || 0 })
  } catch { return apiSuccess({ items: [], total: 0 }) }
}

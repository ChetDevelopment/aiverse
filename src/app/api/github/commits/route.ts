import { NextRequest } from "next/server"
import { apiSuccess, apiError } from "@/lib/api-utils"

interface GHAuthor { name: string; avatar_url?: string }
interface GHCommitData { sha: string; commit: { message: string; author: { name: string; date: string } | null }; author: GHAuthor | null; html_url: string }

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fullName = searchParams.get("full_name")
  if (!fullName) return apiError("full_name is required")

  const token = process.env.GITHUB_TOKEN
  const headers = { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "User-Agent": "AIVerse/1.0" }

  try {
    const res = await fetch(`https://api.github.com/repos/${fullName}/commits?per_page=20`, { headers })
    const data = await res.json()
    const commits = (Array.isArray(data) ? data : []).map((c: GHCommitData) => ({
      sha: c.sha?.slice(0, 7),
      message: c.commit?.message?.split("\n")[0],
      author: c.commit?.author ? { name: c.commit.author.name, avatar_url: c.author?.avatar_url || "" } : null,
      date: c.commit?.author?.date || "",
      html_url: c.html_url,
    }))
    return apiSuccess(commits)
  } catch { return apiError("Failed to fetch commits", 500) }
}

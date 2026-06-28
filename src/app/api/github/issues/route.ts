import { NextRequest } from "next/server"
import { apiSuccess, apiError } from "@/lib/api-utils"

interface GHUser { login: string; avatar_url: string }
interface GHLabel { name: string; color: string; description?: string }
interface GHIssue { number: number; title: string; state: string; body: string | null; pull_request?: unknown; user: GHUser | null; labels: GHLabel[]; comments: number; created_at: string; html_url: string }

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fullName = searchParams.get("full_name")
  if (!fullName) return apiError("full_name is required")

  const token = process.env.GITHUB_TOKEN
  const headers = { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "User-Agent": "AIVerse/1.0" }

  try {
    const [openRes, closedRes, labelsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${fullName}/issues?state=open&per_page=10&sort=updated`, { headers }),
      fetch(`https://api.github.com/repos/${fullName}/issues?state=closed&per_page=5&sort=updated`, { headers }),
      fetch(`https://api.github.com/repos/${fullName}/labels?per_page=20`, { headers }),
    ])

    const [openIssues, closedIssues, labels] = await Promise.all([
      openRes.json(), closedRes.json(), labelsRes.json(),
    ])

    function format(i: GHIssue) {
      return {
        number: i.number, title: i.title, state: i.state, body: i.body?.slice(0, 500) || null,
        user: i.user ? { login: i.user.login, avatar_url: i.user.avatar_url } : null,
        labels: (i.labels || []).map((l) => ({ name: l.name, color: l.color })),
        comments: i.comments, created_at: i.created_at, html_url: i.html_url,
      }
    }

    return apiSuccess({
      open: (Array.isArray(openIssues) ? openIssues : []).filter((i: GHIssue) => !i.pull_request).map(format),
      closed: (Array.isArray(closedIssues) ? closedIssues : []).filter((i: GHIssue) => !i.pull_request).map(format),
      labels: (Array.isArray(labels) ? labels : []).map((l: GHLabel) => ({ name: l.name, color: l.color })),
    })
  } catch { return apiError("Failed to fetch issues", 500) }
}

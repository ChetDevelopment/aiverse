import { NextRequest } from "next/server"
import { apiSuccess, apiError } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fullName = searchParams.get("full_name")
  if (!fullName) return apiError("full_name is required")

  const token = process.env.GITHUB_TOKEN
  const headers = { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "User-Agent": "AIVerse/1.0" }

  try {
    const [openRes, closedRes, draftRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${fullName}/pulls?state=open&per_page=10&sort=updated`, { headers }),
      fetch(`https://api.github.com/repos/${fullName}/pulls?state=closed&per_page=5&sort=updated`, { headers }),
      fetch(`https://api.github.com/repos/${fullName}/pulls?state=open&per_page=5&sort=updated&draft=true`, { headers }).catch(() => null),
    ])

    const openPRs = openRes.ok ? await openRes.json() : []
    const closedPRs = closedRes.ok ? await closedRes.json() : []
    const draftPRs = draftRes && draftRes.ok ? await draftRes.json() : []

    const format = (pr: Record<string, unknown>) => ({
      number: pr.number, title: pr.title, state: pr.state, draft: pr.draft || false,
      body: (pr.body as string || "").slice(0, 300),
      user: { login: (pr.user as Record<string, unknown>)?.login || "", avatar_url: (pr.user as Record<string, unknown>)?.avatar_url || "" },
      labels: ((pr.labels as Record<string, unknown>[]) || []).map((l: Record<string, unknown>) => ({ name: l.name, color: l.color })),
      comments: pr.comments || 0, review_comments: pr.review_comments || 0,
      created_at: pr.created_at, html_url: pr.html_url,
      head: { ref: (pr.head as Record<string, unknown>)?.ref || "", repo: ((pr.head as Record<string, unknown>)?.repo as Record<string, unknown>)?.full_name as string || "" },
      base: { ref: (pr.base as Record<string, unknown>)?.ref || "" },
      merged: pr.merged || false, mergeable: pr.mergeable,
      additions: pr.additions, deletions: pr.deletions, changed_files: pr.changed_files,
    })

    return apiSuccess({
      open: (Array.isArray(openPRs) ? openPRs : []).map(format),
      closed: (Array.isArray(closedPRs) ? closedPRs : []).map(format),
      draft: (Array.isArray(draftPRs) ? draftPRs : []).filter((p: Record<string, unknown>) => p.draft).map(format),
    })
  } catch { return apiError("Failed to fetch pull requests", 500) }
}

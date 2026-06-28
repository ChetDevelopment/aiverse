import { NextRequest } from "next/server"
import { apiSuccess, apiError } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fullName = searchParams.get("full_name")
  if (!fullName) return apiError("full_name is required")

  const token = process.env.GITHUB_TOKEN
  const headers = { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "User-Agent": "AIVerse/1.0" }

  try {
    const [milestonesRes, envRes, branchRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${fullName}/milestones?per_page=10&state=open&direction=desc`, { headers }),
      fetch(`https://api.github.com/repos/${fullName}/environments?per_page=10`, { headers }).catch(() => null),
      fetch(`https://api.github.com/repos/${fullName}/branches?per_page=10&protected=true`, { headers }).catch(() => null),
    ])

    const milestones = milestonesRes.ok ? await milestonesRes.json() : []
    const environments = envRes && envRes.ok ? await envRes.json() : []
    const branches = branchRes && branchRes.ok ? await branchRes.json() : []

    return apiSuccess({
      milestones: (Array.isArray(milestones) ? milestones : []).map((m: Record<string, unknown>) => ({
        title: m.title, description: m.description, state: m.state,
        open_issues: m.open_issues, closed_issues: m.closed_issues,
        progress: (m.closed_issues as number || 0) / ((m.open_issues as number || 0) + (m.closed_issues as number || 1)) * 100,
        due_on: m.due_on, html_url: m.html_url,
      })),
      environments: (Array.isArray(environments) ? environments : []).map((e: Record<string, unknown>) => ({
        name: e.name, html_url: e.html_url,
      })),
      protected_branches: (Array.isArray(branches) ? branches : []).map((b: Record<string, unknown>) => ({
        name: b.name, protected: b.protected,
        sha: (b.commit as Record<string, unknown>)?.sha?.toString().slice(0, 7),
      })),
    })
  } catch { return apiSuccess({ milestones: [], environments: [], protected_branches: [] }) }
}

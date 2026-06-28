import { NextRequest } from "next/server"
import { apiSuccess, apiError } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fullName = searchParams.get("full_name")
  if (!fullName) return apiError("full_name is required")

  const token = process.env.GITHUB_TOKEN
  const headers = { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "User-Agent": "AIVerse/1.0" }

  try {
    const [advisoriesRes, codeScanRes, dependabotRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${fullName}/security-advisories?per_page=5`, { headers }).catch(() => null),
      fetch(`https://api.github.com/repos/${fullName}/code-scanning/alerts?per_page=5&state=open`, { headers }).catch(() => null),
      fetch(`https://api.github.com/repos/${fullName}/dependabot/alerts?per_page=5&state=open`, { headers }).catch(() => null),
    ])

    const advisories = advisoriesRes?.ok ? await advisoriesRes.json() : []
    const codeScan = codeScanRes?.ok ? await codeScanRes.json() : []
    const dependabot = dependabotRes?.ok ? await dependabotRes.json() : []

    return apiSuccess({
      advisories: (Array.isArray(advisories) ? advisories : []).map((a: Record<string, unknown>) => ({
        ghsa_id: a.ghsa_id, summary: a.summary, severity: a.severity, published_at: a.published_at, html_url: a.html_url,
      })),
      code_scanning: (Array.isArray(codeScan) ? codeScan : []).slice(0, 5).map((a: Record<string, unknown>) => ({
        rule: (a.rule as Record<string, unknown>)?.description || "", severity: (a.rule as Record<string, unknown>)?.severity || "", created_at: a.created_at,
      })),
      dependabot: (Array.isArray(dependabot) ? dependabot : []).slice(0, 5).map((a: Record<string, unknown>) => ({
        package_name: ((a.security_advisory as Record<string, unknown>)?.package as Record<string, unknown>)?.name as string || "", severity: a.severity, summary: a.summary,
      })),
    })
  } catch { return apiSuccess({ advisories: [], code_scanning: [], dependabot: [] }) }
}

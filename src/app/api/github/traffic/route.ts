import { NextRequest } from "next/server"
import { apiSuccess, apiError } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fullName = searchParams.get("full_name")
  if (!fullName) return apiError("full_name is required")

  const token = process.env.GITHUB_TOKEN
  const headers = { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "User-Agent": "AIVerse/1.0" }

  try {
    const [viewsRes, clonesRes, forksRes, depsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${fullName}/traffic/views`, { headers }),
      fetch(`https://api.github.com/repos/${fullName}/traffic/clones`, { headers }),
      fetch(`https://api.github.com/repos/${fullName}/forks?per_page=3&sort=oldest`, { headers }),
      fetch(`https://api.github.com/repos/${fullName}/dependent_repos?per_page=3`, { headers }).catch(() => null),
    ])

    const views = viewsRes.ok ? await viewsRes.json() : { count: 0, uniques: 0, views: [] }
    const clones = clonesRes.ok ? await clonesRes.json() : { count: 0, uniques: 0, clones: [] }
    const forks = forksRes.ok ? await forksRes.json() : []
    const dependents = depsRes && depsRes.ok ? await depsRes.json() : { total_count: 0, repositories: [] }

    return apiSuccess({
      views: { total: views.count || 0, unique: views.uniques || 0, daily: (views.views || []).slice(-14) },
      clones: { total: clones.count || 0, unique: clones.uniques || 0, daily: (clones.clones || []).slice(-14) },
      forks: (Array.isArray(forks) ? forks : []).map((f: Record<string, unknown>) => {
        const owner = f.owner as Record<string, unknown> | null
        return { owner: owner?.login as string || "", avatar: owner?.avatar_url as string || "", url: f.html_url as string, stars: f.stargazers_count as number || 0 }
      }),
      dependents_count: dependents.total_count || 0,
    })
  } catch { return apiSuccess({ views: { total: 0, unique: 0, daily: [] }, clones: { total: 0, unique: 0, daily: [] }, forks: [], dependents_count: 0 }) }
}

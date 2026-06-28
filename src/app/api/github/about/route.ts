import { NextRequest } from "next/server"
import { apiSuccess, apiError } from "@/lib/api-utils"
import { checkCommonFiles, getBadgeUrl } from "@/lib/discovery/repo-files"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fullName = searchParams.get("full_name")
  if (!fullName) return apiError("full_name is required")

  const token = process.env.GITHUB_TOKEN
  const headers = { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "User-Agent": "AIVerse/1.0" }

  try {
    // Fetch repo root contents
    const rootRes = await fetch(`https://api.github.com/repos/${fullName}/contents`, { headers })
    const rootData = rootRes.ok ? await rootRes.json() : []

    // Fetch community profile
    const communityRes = await fetch(`https://api.github.com/repos/${fullName}/community/profile`, { headers })
    const community = communityRes.ok ? await communityRes.json() : {}

    // Check for GitHub pages
    const pagesRes = await fetch(`https://api.github.com/repos/${fullName}/pages`, { headers })
    const hasPages = pagesRes.ok

    // Check discussions
    const repoRes = await fetch(`https://api.github.com/repos/${fullName}`, { headers })
    const repo = repoRes.ok ? await repoRes.json() : {}
    const hasDiscussions = repo.has_discussions || false
    const hasWiki = repo.has_wiki || false
    const hasProjects = repo.has_projects || false
    const homepage = repo.homepage || null

    // Get workflow files
    const workflowsRes = await fetch(`https://api.github.com/repos/${fullName}/actions/workflows?per_page=5`, { headers })
    const workflows = workflowsRes.ok ? await workflowsRes.json() : { workflows: [] }

    const rootFiles = (Array.isArray(rootData) ? rootData : []).map((f: Record<string, unknown>) => ({
      name: f.name as string, path: f.path as string, type: f.type as string, size: (f.size as number) || 0, download_url: (f.download_url as string) || undefined,
    }))

    const categorized = await checkCommonFiles(fullName, rootFiles)
    const badges = getBadgeUrl({ fullName, type: repo.language || "" })

    return apiSuccess({
      categorized,
      community: {
        health_percentage: community.health_percentage || 0,
        files: community.files || {},
        description: community.description || "",
      },
      features: {
        has_discussions: hasDiscussions,
        has_wiki: hasWiki,
        has_projects: hasProjects,
        has_pages: hasPages,
        has_homepage: !!homepage,
        homepage_url: homepage,
      },
      workflows: ((workflows.workflows as Record<string, unknown>[]) || []).slice(0, 5).map((w) => ({
        name: w.name as string, state: w.state as string, path: w.path as string,
      })),
      badges,
    })
  } catch {
    return apiSuccess({ categorized: [], features: {}, workflows: [], badges: [] })
  }
}

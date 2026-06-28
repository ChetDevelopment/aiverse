import { NextRequest } from "next/server"
import { apiSuccess, apiError } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fullName = searchParams.get("full_name")
  if (!fullName) return apiError("full_name is required")

  const token = process.env.GITHUB_TOKEN
  const headers = { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "User-Agent": "AIVerse/1.0" }

  try {
    const [repoRes, tagsRes, depsRes, secretsRes, actionsRes, codeownersRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${fullName}`, { headers }),
      fetch(`https://api.github.com/repos/${fullName}/tags?per_page=5`, { headers }),
      fetch(`https://api.github.com/repos/${fullName}/dependency-graph/dependencies?per_page=5`, { headers }).catch(() => null),
      fetch(`https://api.github.com/repos/${fullName}/secrets/public-key`, { headers }).catch(() => null),
      fetch(`https://api.github.com/repos/${fullName}/actions/runs?per_page=5&status=success`, { headers }).catch(() => null),
      fetch(`https://api.github.com/repos/${fullName}/contents/.github/CODEOWNERS`, { headers }).catch(() => null),
    ])

    const repo = repoRes.ok ? await repoRes.json() : {}
    const tags = tagsRes.ok ? await tagsRes.json() : []

    // Clone URLs
    const cloneUrl = {
      https: repo.clone_url || `https://github.com/${fullName}.git`,
      ssh: repo.ssh_url || `git@github.com:${fullName}.git`,
    }

    // Get workflow runs
    const workflowRuns = actionsRes && actionsRes.ok ? (await actionsRes.json()).workflow_runs || [] : []
    const lastWorkflowRun = workflowRuns.length > 0 ? {
      name: workflowRuns[0].name,
      status: workflowRuns[0].status,
      conclusion: workflowRuns[0].conclusion,
      url: workflowRuns[0].html_url,
      date: workflowRuns[0].run_started_at,
    } : null

    // Check for common config files
    const configFiles: Record<string, string | null> = {}
    const configPaths = [
      ".github/CODEOWNERS", ".github/SECURITY.md", "CONTRIBUTING.md",
      "CODE_OF_CONDUCT.md", "SECURITY.md", "README.md",
    ]
    for (const configPath of configPaths) {
      try {
        const res = await fetch(`https://api.github.com/repos/${fullName}/contents/${configPath}`, { headers })
        if (res.ok) configFiles[configPath] = "present"
      } catch (error) {
        console.error("[API_GITHUB_DETAILS] Config check", error)
      }
    }

    return apiSuccess({
      clone_urls: cloneUrl,
      last_workflow_run: lastWorkflowRun,
      tags: (Array.isArray(tags) ? tags : []).slice(0, 5).map((t: Record<string, unknown>) => ({
        name: t.name as string,
        url: (t.zipball_url as string) || "",
      })),
      codeowners: codeownersRes?.ok ? "present" : null,
      has_security_policy: !!configFiles[".github/SECURITY.md"] || !!configFiles["SECURITY.md"],
      features: {
        has_issues: repo.has_issues,
        has_projects: repo.has_projects,
        has_wiki: repo.has_wiki,
        has_discussions: repo.has_discussions,
        has_pages: repo.has_pages,
        archived: repo.archived,
        disabled: repo.disabled,
        visibility: repo.visibility || "public",
        fork: repo.fork,
      },
    })
  } catch (error) {
    console.error("[API_GITHUB_DETAILS]", error)
    return apiSuccess({ clone_urls: { https: "", ssh: "" }, tags: [], features: {} })
  }
}

import { prisma } from "@/lib/prisma"
import { searchGitHubRepos } from "@/lib/discovery/github"
import { apiSuccess, handleApiError, requireApiAdmin } from "@/lib/api-utils"

export async function POST() {
  try {
    await requireApiAdmin()

    const start = Date.now()
    const { repos, log } = await searchGitHubRepos()

    let newCount = 0
    for (const repo of repos) {
      const existing = await prisma.discoveredProject.findUnique({
        where: { fullName: repo.fullName },
      })
      if (!existing) {
        await prisma.discoveredProject.create({
          data: {
            repoName: repo.repoName,
            repoOwner: repo.repoOwner,
            fullName: repo.fullName,
            githubUrl: repo.githubUrl,
            description: repo.description,
            stars: repo.stars,
            forks: repo.forks,
            watchers: repo.watchers,
            language: repo.language,
            topics: repo.topics,
            license: repo.license,
            summary: null,
            category: repo.category,
            logoUrl: repo.logoUrl,
            readmeScore: repo.readmeScore,
            lastPushAt: repo.lastPushAt,
          },
        })
        newCount++
      }
    }

    await prisma.discoveryLog.create({
      data: {
        source: "github",
        query: log.map((l) => l.query).join("; ").slice(0, 1000),
        resultsFound: repos.length,
        newDiscovered: newCount,
        durationMs: Date.now() - start,
      },
    })

    return apiSuccess({
      totalFound: repos.length,
      newDiscovered: newCount,
      duration: Date.now() - start,
      queries: log,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET() {
  const projects = await prisma.discoveredProject.findMany({
    where: { status: "APPROVED" },
    orderBy: { stars: "desc" },
    take: 50,
  })
  return apiSuccess(projects)
}

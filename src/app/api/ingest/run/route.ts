import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, apiSuccess, requireApiAdmin } from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  try {
    await requireApiAdmin()
  } catch {
    return apiError("Unauthorized", 401)
  }

  const { source = "github", force = false } = await request.json().catch(() => ({ source: "github" }))

  try {
    let result

    switch (source) {
      case "github": {
        const { ingestGitHubTrending } = await import("@/lib/ingestion/github-ingestor")
        result = await ingestGitHubTrending()
        break
      }
      case "prompts": {
        const { ingestPublicPrompts } = await import("@/lib/ingestion/prompts-ingestor")
        result = await ingestPublicPrompts()
        break
      }
      case "all": {
        const { ingestGitHubTrending } = await import("@/lib/ingestion/github-ingestor")
        const { ingestPublicPrompts } = await import("@/lib/ingestion/prompts-ingestor")
        const [r1, r2] = await Promise.all([
          ingestGitHubTrending().catch((e) => ({ sourceType: "github", itemsCreated: 0, itemsUpdated: 0, itemsSkipped: 0, itemsFailed: 1, errors: [e.message], status: "failed", duration: 0, itemsFound: 0 })),
          ingestPublicPrompts().catch((e) => ({ sourceType: "prompts", itemsCreated: 0, itemsUpdated: 0, itemsSkipped: 0, itemsFailed: 1, errors: [e.message], status: "failed", duration: 0, itemsFound: 0 })),
        ])
        result = { github: r1, prompts: r2 }
        break
      }
      default:
        return apiError(`Unknown source: ${source}`)
    }

    return apiSuccess(result)
  } catch (e: any) {
    return apiError(e.message || "Ingestion failed", 500)
  }
}

export async function GET() {
  try {
    await requireApiAdmin()
  } catch {
    return apiError("Unauthorized", 401)
  }

  const logs = await prisma.ingestionLog.findMany({
    orderBy: { startedAt: "desc" },
    take: 50,
    include: { source: true },
  })

  const pendingCount = await prisma.discoveredProject.count({ where: { status: "PENDING" } })
  const promptPending = await prisma.discoveredPrompt.count({ where: { status: "pending" } })

  return apiSuccess({ logs, counts: { pendingProjects: pendingCount, pendingPrompts: promptPending } })
}

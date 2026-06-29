import { prisma } from "@/lib/prisma"
import { slugify, qualityScore, classifyTopic, createIngestionLog, completeIngestionLog, IngestionResult } from "./engine"
import { logger } from "@/lib/logger"

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const SEARCH_QUERIES = [
  "ai+topic:ai", "machine-learning+topic:machine-learning", "llm+topic:llm",
  "generative-ai", "prompt-engineering", "langchain", "openai",
  "stable-diffusion", "computer-vision", "nlp", "deep-learning",
  "autonomous-agents", "rag", "fine-tuning", "gpt",
]

export async function ingestGitHubTrending(): Promise<IngestionResult> {
  const start = Date.now()
  const log = await createIngestionLog("github")
  const errors: string[] = []
  let created = 0, updated = 0, skipped = 0, failed = 0

  for (const query of SEARCH_QUERIES) {
    try {
      const result = await searchGitHub(query)
      for (const repo of result) {
        const existing = await prisma.discoveredProject.findUnique({ where: { fullName: repo.full_name } })
        if (existing) {
          await prisma.discoveredProject.update({
            where: { id: existing.id },
            data: {
              stars: repo.stargazers_count || existing.stars,
              forks: repo.forks_count || existing.forks,
              description: repo.description || existing.description,
              lastPushAt: repo.pushed_at ? new Date(repo.pushed_at) : existing.lastPushAt,
              topics: repo.topics?.join(", ") || existing.topics,
              language: repo.language || existing.language,
            },
          })
          updated++
        } else {
          const cats = classifyTopic(repo.name, repo.description || "", repo.topics || [])
          await prisma.discoveredProject.create({
            data: {
              repoName: repo.name,
              repoOwner: repo.owner?.login || "unknown",
              fullName: repo.full_name,
              githubUrl: repo.html_url,
              description: repo.description || "",
              stars: repo.stargazers_count || 0,
              forks: repo.forks_count || 0,
              watchers: repo.watchers_count || 0,
              language: repo.language,
              topics: repo.topics?.join(", ") || null,
              license: repo.license?.spdx_id || null,
              status: "PENDING",
              category: cats[0] || null,
              lastPushAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
            },
          })
          created++
        }
      }
    } catch (e: any) {
      errors.push(`Query "${query}": ${e.message}`)
      failed++
      await sleep(2000)
    }
    await sleep(1500)
  }

  const result: IngestionResult = {
    sourceType: "github",
    itemsFound: created + updated + skipped,
    itemsCreated: created,
    itemsUpdated: updated,
    itemsSkipped: skipped,
    itemsFailed: failed,
    errors,
    duration: Date.now() - start,
    status: errors.length > SEARCH_QUERIES.length / 2 ? "failed" : "completed",
  }

  await completeIngestionLog(log.id, result)
  return result
}

async function searchGitHub(query: string, maxPages = 2) {
  const token = GITHUB_TOKEN || process.env.GITHUB_TOKEN
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "AIVerse/1.0",
  }
  if (token) headers.Authorization = `token ${token}`

  const allItems: any[] = []
  const sort = "stars"
  const order = "desc"

  for (let page = 1; page <= maxPages; page++) {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=${sort}&order=${order}&per_page=50&page=${page}`
    const res = await fetch(url, { headers })
    if (!res.ok) {
      if (res.status === 403) throw new Error("GitHub rate limited")
      throw new Error(`GitHub API ${res.status}`)
    }
    const data = await res.json()
    if (!data.items?.length) break
    allItems.push(...data.items)

    // Check if we can paginate
    const linkHeader = res.headers.get("link") || ""
    if (!linkHeader.includes('rel="next"')) break
  }

  return allItems
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

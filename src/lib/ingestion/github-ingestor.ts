import { prisma } from "@/lib/prisma"
import { classifyTopic, createIngestionLog, completeIngestionLog, IngestionResult, qualityScore } from "./engine"

const BASE_TOPICS = [
  "ai", "machine-learning", "deep-learning", "llm", "natural-language-processing",
  "computer-vision", "generative-ai", "prompt-engineering", "autonomous-agents",
  "rag", "fine-tuning", "embedding", "langchain", "openai",
]

const MIN_STARS_FOR_AUTO_APPROVE = 30
const MIN_STARS_FOR_DISCOVERY = 10

export async function ingestGitHubTrending(): Promise<IngestionResult> {
  const start = Date.now()
  const log = await createIngestionLog("github")
  const errors: string[] = []
  let created = 0, updated = 0, skipped = 0, failed = 0

  // 1. Discover trending topics from GitHub
  const topics = await discoverTopics()

  // 2. Search for repos in each topic
  for (const topic of topics) {
    try {
      const repos = await searchByTopic(topic)
      for (const repo of repos) {
        const existing = await prisma.discoveredProject.findUnique({ where: { fullName: repo.full_name } })
        if (existing) {
          await prisma.discoveredProject.update({
            where: { id: existing.id },
            data: {
              stars: Math.max(repo.stargazers_count || 0, existing.stars),
              forks: Math.max(repo.forks_count || 0, existing.forks),
              description: repo.description || existing.description,
              lastPushAt: repo.pushed_at ? new Date(repo.pushed_at) : existing.lastPushAt,
              topics: repo.topics?.join(", ") || existing.topics,
              language: repo.language || existing.language,
              status: existing.status === "PENDING" && repo.stargazers_count > MIN_STARS_FOR_AUTO_APPROVE ? "APPROVED" : existing.status,
            },
          })
          updated++
        } else if (repo.stargazers_count >= MIN_STARS_FOR_DISCOVERY) {
          const cats = classifyTopic(repo.name, repo.description || "", repo.topics || [])
          const autoApprove = repo.stargazers_count >= MIN_STARS_FOR_AUTO_APPROVE
          const daysSincePush = repo.pushed_at ? (Date.now() - new Date(repo.pushed_at).getTime()) / 86400000 : 999
          const score = qualityScore(repo.stargazers_count || 0, repo.forks_count || 0, daysSincePush)

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
              status: autoApprove ? "APPROVED" : "PENDING",
              category: cats[0] || null,
              readmeScore: score,
              lastPushAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
            },
          })
          created++
        } else {
          skipped++
        }
      }
    } catch (e: any) {
      errors.push(topic)
      failed++
    }
    await sleep(1200)
  }

  // 3. Auto-approve old pending items that now have enough stars
  try {
    const pending = await prisma.discoveredProject.findMany({
      where: { status: "PENDING", stars: { gte: MIN_STARS_FOR_AUTO_APPROVE } },
      take: 50,
    })
    for (const p of pending) {
      await prisma.discoveredProject.update({ where: { id: p.id }, data: { status: "APPROVED" } })
    }
  } catch {}

  const result: IngestionResult = {
    sourceType: "github",
    itemsFound: created + updated + skipped,
    itemsCreated: created,
    itemsUpdated: updated,
    itemsSkipped: skipped,
    itemsFailed: failed,
    errors,
    duration: Date.now() - start,
    status: errors.length > topics.length / 2 ? "failed" : "completed",
  }
  await completeIngestionLog(log.id, result)
  return result
}

async function discoverTopics(): Promise<string[]> {
  const topics = [...BASE_TOPICS]
  try {
    // Get trending repos to discover new topics
    const res = await fetch(
      "https://api.github.com/search/repositories?q=ai+created:>2024-01-01&sort=stars&order=desc&per_page=25",
      { headers: { Accept: "application/vnd.github.v3+json", "User-Agent": "AIVerse/1.0" } }
    )
    if (res.ok) {
      const data = await res.json()
      if (data.items) {
        for (const repo of data.items) {
          if (repo.topics) topics.push(...repo.topics)
        }
      }
    }
  } catch {}

  // Deduplicate and clean
  return [...new Set(topics.map((t) => t.toLowerCase().replace(/[^a-z0-9-]/g, "")))]
    .filter((t) => t.length > 2 && t.length < 30)
    .slice(0, 30)
}

async function searchByTopic(topic: string, maxPages = 2) {
  const token = process.env.GITHUB_TOKEN
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "AIVerse/1.0",
  }
  if (token) headers.Authorization = `token ${token}`

  const allItems: any[] = []
  for (let page = 1; page <= maxPages; page++) {
    const url = `https://api.github.com/search/repositories?q=topic:${encodeURIComponent(topic)}&sort=stars&order=desc&per_page=50&page=${page}`
    const res = await fetch(url, { headers })
    if (!res.ok) break
    const data = await res.json()
    if (!data.items?.length) break
    allItems.push(...data.items)
    const link = res.headers.get("link") || ""
    if (!link.includes('rel="next"')) break
  }
  return allItems
}

async function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)) }

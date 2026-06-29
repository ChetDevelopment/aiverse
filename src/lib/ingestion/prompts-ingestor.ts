import { prisma } from "@/lib/prisma"
import { createIngestionLog, completeIngestionLog, IngestionResult } from "./engine"

const MIN_STARS_FOR_AUTO_APPROVE = 100
const QUALITY_THRESHOLD = 30

export async function ingestPublicPrompts(): Promise<IngestionResult> {
  const start = Date.now()
  const log = await createIngestionLog("prompts")
  const errors: string[] = []
  let created = 0, skipped = 0, failed = 0
  const updated = 0

  // Auto-discover prompt repos from GitHub
  const repos = await discoverPromptRepos()

  for (const repo of repos) {
    try {
      const prompts = await fetchPromptsFromRepo(repo.fullName, repo.htmlUrl)
      for (const prompt of prompts) {
        if (prompt.content.length < 20) { skipped++; continue }

        const existing = await prisma.discoveredPrompt.findFirst({
          where: { title: prompt.title, sourceUrl: prompt.sourceUrl },
        })
        if (existing) { skipped++; continue }

        const autoApprove = prompt.qualityScore >= QUALITY_THRESHOLD
        await prisma.discoveredPrompt.create({
          data: {
            source: "github",
            sourceUrl: prompt.sourceUrl,
            title: prompt.title.slice(0, 80),
            content: prompt.content.slice(0, 2000),
            description: prompt.description.slice(0, 200),
            category: prompt.category,
            difficulty: prompt.difficulty,
            qualityScore: prompt.qualityScore,
            status: autoApprove ? "approved" : "pending",
          },
        })
        created++
      }
    } catch (e: any) {
      errors.push(repo.fullName)
      failed++
    }
  }

  // Auto-import approved prompts into the main Prompt table
  try {
    const approved = await prisma.discoveredPrompt.findMany({
      where: { status: "approved" },
      take: 30,
    })
    for (const dp of approved) {
      const slug = dp.title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").slice(0, 80)
      const existing = await prisma.prompt.findFirst({ where: { title: dp.title } })
      if (existing) {
        await prisma.discoveredPrompt.update({ where: { id: dp.id }, data: { status: "imported" } })
        continue
      }
      const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } })
      await prisma.prompt.create({
        data: {
          toolId: (await prisma.aiTool.findFirst({ where: { slug: dp.toolSlug || undefined } }))?.id
            || (await prisma.aiTool.findFirst())?.id
            || (await prisma.aiTool.create({
              data: { name: dp.toolName || "General", slug: slug || "general", tagline: "", description: "", websiteUrl: "https://example.com", isPublished: true },
            })).id,
          title: dp.title.slice(0, 80),
          content: dp.content,
          description: dp.description,
          category: dp.category,
          difficulty: dp.difficulty,
          isOfficial: false,
          userId: admin?.id || undefined,
        },
      })
      await prisma.discoveredPrompt.update({ where: { id: dp.id }, data: { status: "imported" } })
      created++
    }
  } catch {}

  const result: IngestionResult = {
    sourceType: "prompts",
    itemsFound: created + updated + skipped,
    itemsCreated: created,
    itemsUpdated: updated,
    itemsSkipped: skipped,
    itemsFailed: failed,
    errors,
    duration: Date.now() - start,
    status: errors.length > repos.length / 2 ? "failed" : "completed",
  }
  await completeIngestionLog(log.id, result)
  return result
}

async function discoverPromptRepos() {
  const repos: { fullName: string; htmlUrl: string }[] = []
  const queries = ["awesome+prompt", "awesome+chatgpt", "prompt-collection", "awesome-gpt", "prompt-engineering"]

  for (const query of queries) {
    try {
      const res = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=5`,
        { headers: { Accept: "application/vnd.github.v3+json", "User-Agent": "AIVerse/1.0" } }
      )
      if (!res.ok) continue
      const data = await res.json()
      if (data.items) {
        for (const item of data.items) {
          repos.push({ fullName: item.full_name, htmlUrl: item.html_url })
        }
      }
    } catch {}
  }
  return repos.slice(0, 15)
}

async function fetchPromptsFromRepo(repo: string, repoUrl: string) {
  const prompts: any[] = []

  // Try README
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/readme`, {
      headers: { Accept: "application/vnd.github.v3.raw", "User-Agent": "AIVerse/1.0" },
    })
    if (res.ok) {
      const text = await res.text()
      prompts.push(...parseReadmePrompts(text, repoUrl))
    }
  } catch {}

  // Try prompts.csv / prompts.txt
  try {
    const res = await fetch(`https://raw.githubusercontent.com/${repo}/main/prompts.csv`, {
      headers: { "User-Agent": "AIVerse/1.0" },
    })
    if (res.ok) {
      const text = await res.text()
      prompts.push(...parseCsvPrompts(text, repoUrl))
    }
  } catch {}

  return prompts
}

function parseReadmePrompts(markdown: string, sourceUrl: string) {
  const prompts: any[] = []
  const lines = markdown.split("\n")
  let title = "", content = "", inCode = false

  for (const line of lines) {
    if (line.startsWith("```")) { inCode = !inCode; continue }
    if (inCode) { content += (content ? "\n" : "") + line; continue }
    if (line.startsWith("## ") || line.startsWith("### ")) {
      if (title && content.length > 20) {
        prompts.push(makePrompt(title, content, sourceUrl))
      }
      title = line.replace(/^#+\s*/, "").slice(0, 80)
      content = ""
    }
  }
  if (title && content.length > 20) prompts.push(makePrompt(title, content, sourceUrl))
  return prompts
}

function parseCsvPrompts(csv: string, sourceUrl: string) {
  const prompts: any[] = []
  const lines = csv.split("\n")
  for (let i = 1; i < Math.min(lines.length, 300); i++) {
    const parts = lines[i].split(",")
    if (parts.length < 2) continue
    const title = (parts[0] || "").trim().replace(/^"|"$/g, "").slice(0, 80)
    const content = parts.slice(1).join(",").trim().replace(/^"|"$/g, "")
    if (!title || !content || content.length < 20) continue
    prompts.push(makePrompt(title, content, sourceUrl))
  }
  return prompts
}

function makePrompt(title: string, content: string, sourceUrl: string) {
  const text = `${title} ${content}`.toLowerCase()
  const category = text.match(/code|program|function|debug|react|python|javascript|typescript/) ? "coding"
    : text.match(/image|generate|create|art|design|photo|illustration/) ? "creative"
    : text.match(/write|blog|article|essay|copy|content|email|newsletter/) ? "writing"
    : text.match(/business|marketing|sales|seo|ad|campaign/) ? "business"
    : text.match(/analyze|analysis|report|data|research|summarize/) ? "analysis"
    : text.match(/learn|study|teach|explain|tutor|education/) ? "education"
    : "writing"

  return {
    title: title.slice(0, 80),
    content: content.slice(0, 2000),
    description: content.slice(0, 150),
    category,
    difficulty: content.length > 300 ? "intermediate" : "beginner",
    qualityScore: Math.min(Math.round(content.length / 3 + (title.length > 20 ? 15 : 0)), 90),
    sourceUrl,
  }
}

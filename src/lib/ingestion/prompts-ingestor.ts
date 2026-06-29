import { prisma } from "@/lib/prisma"
import { slugify, createIngestionLog, completeIngestionLog, IngestionResult } from "./engine"
import { logger } from "@/lib/logger"

const PROMPT_SOURCES = [
  {
    owner: "f/awesome-chatgpt-prompts",
    type: "github",
    file: "prompts.csv",
  },
  {
    owner: "fka/awesome-chatgpt-code-prompts",
    type: "github",
    file: "README.md",
  },
  {
    owner: "williamberg/awesome-chatgpt-prompts",
    type: "github",
    file: "README.md",
  },
]

export async function ingestPublicPrompts(): Promise<IngestionResult> {
  const start = Date.now()
  const log = await createIngestionLog("prompts")
  const errors: string[] = []
  let created = 0, updated = 0, skipped = 0, failed = 0

  for (const source of PROMPT_SOURCES) {
    try {
      if (source.type === "github") {
        const prompts = await fetchGitHubPrompts(source.owner)
        for (const prompt of prompts) {
          const existing = await prisma.discoveredPrompt.findFirst({
            where: { title: prompt.title, sourceUrl: prompt.sourceUrl },
          })
          if (existing) {
            skipped++
            continue
          }
          const tool = prompt.toolSlug
            ? await prisma.aiTool.findFirst({ where: { slug: prompt.toolSlug } })
            : null

          await prisma.discoveredPrompt.create({
            data: {
              source: "github",
              sourceUrl: prompt.sourceUrl,
              title: prompt.title,
              content: prompt.content,
              description: prompt.description,
              category: prompt.category,
              difficulty: prompt.difficulty,
              toolName: prompt.toolName || tool?.name || null,
              toolSlug: prompt.toolSlug || tool?.slug || null,
              qualityScore: prompt.qualityScore || 50,
              status: "pending",
            },
          })
          created++
        }
      }
    } catch (e: any) {
      errors.push(`Source "${source.owner}": ${e.message}`)
      failed++
    }
  }

  const result: IngestionResult = {
    sourceType: "prompts",
    itemsFound: created + updated + skipped,
    itemsCreated: created,
    itemsUpdated: updated,
    itemsSkipped: skipped,
    itemsFailed: failed,
    errors,
    duration: Date.now() - start,
    status: errors.length > 2 ? "failed" : "completed",
  }

  await completeIngestionLog(log.id, result)
  return result
}

interface ParsedPrompt {
  title: string
  content: string
  description: string
  category: string
  difficulty: string
  toolSlug?: string
  toolName?: string
  qualityScore: number
  sourceUrl: string
}

async function fetchGitHubPrompts(repo: string): Promise<ParsedPrompt[]> {
  const [owner, repoName] = repo.split("/")
  const results: ParsedPrompt[] = []

  // Try README.md first
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/readme`,
      { headers: { Accept: "application/vnd.github.v3.raw", "User-Agent": "AIVerse/1.0" } }
    )
    if (res.ok) {
      const text = await res.text()
      const prompts = parseReadmePrompts(text, `https://github.com/${owner}/${repoName}`)
      results.push(...prompts)
    }
  } catch {}

  // Try prompts.csv
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${owner}/${repoName}/main/prompts.csv`,
      { headers: { "User-Agent": "AIVerse/1.0" } }
    )
    if (res.ok) {
      const text = await res.text()
      const prompts = parseCSVPrompts(text, `https://github.com/${owner}/${repoName}`)
      results.push(...prompts)
    }
  } catch {}

  return results
}

function parseReadmePrompts(markdown: string, sourceUrl: string): ParsedPrompt[] {
  const prompts: ParsedPrompt[] = []
  const lines = markdown.split("\n")
  let currentTitle = ""
  let currentContent = ""
  let inCode = false

  for (const line of lines) {
    if (line.startsWith("```")) { inCode = !inCode; continue }
    if (inCode) { currentContent += (currentContent ? "\n" : "") + line; continue }
    if (line.startsWith("## ") || line.startsWith("### ")) {
      if (currentTitle && currentContent.length > 20) {
        prompts.push({
          title: currentTitle,
          content: currentContent.slice(0, 2000),
          description: currentContent.slice(0, 150),
          category: classifyPrompt(currentTitle, currentContent),
          difficulty: "intermediate",
          qualityScore: Math.min(currentContent.length / 2, 90),
          sourceUrl,
        })
      }
      currentTitle = line.replace(/^#+\s*/, "")
      currentContent = ""
    }
  }
  if (currentTitle && currentContent.length > 20) {
    prompts.push({
      title: currentTitle,
      content: currentContent.slice(0, 2000),
      description: currentContent.slice(0, 150),
      category: classifyPrompt(currentTitle, currentContent),
      difficulty: "intermediate",
      qualityScore: Math.min(currentContent.length / 2, 90),
      sourceUrl,
    })
  }

  return prompts
}

function parseCSVPrompts(csv: string, sourceUrl: string): ParsedPrompt[] {
  const prompts: ParsedPrompt[] = []
  const lines = csv.split("\n")
  for (let i = 1; i < Math.min(lines.length, 200); i++) {
    const parts = lines[i].split(",")
    if (parts.length < 2) continue
    const title = parts[0]?.trim()?.replace(/^"|"$/g, "") || ""
    const content = parts.slice(1).join(",").trim().replace(/^"|"$/g, "") || ""
    if (!title || !content || content.length < 20) continue
    prompts.push({
      title: title.slice(0, 80),
      content: content.slice(0, 2000),
      description: content.slice(0, 150),
      category: classifyPrompt(title, content),
      difficulty: "intermediate",
      qualityScore: Math.min(content.length, 85),
      sourceUrl,
    })
  }
  return prompts
}

function classifyPrompt(title: string, content: string): string {
  const text = `${title} ${content}`.toLowerCase()
  if (text.match(/code|program|function|debug|react|python|javascript|typescript|api|sql/)) return "coding"
  if (text.match(/image|generate|create|art|design|photo|illustration|dalle|midjourney/)) return "creative"
  if (text.match(/write|blog|article|essay|copy|content|email|newsletter/)) return "writing"
  if (text.match(/business|marketing|sales|seo|ad|campaign|strategy/)) return "business"
  if (text.match(/analyze|analysis|report|data|research|summarize/)) return "analysis"
  if (text.match(/learn|study|teach|explain|tutor|education/)) return "education"
  return "writing"
}

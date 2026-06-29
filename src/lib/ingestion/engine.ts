import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

export interface IngestionResult {
  sourceType: string
  sourceId?: string
  itemsFound: number
  itemsCreated: number
  itemsUpdated: number
  itemsSkipped: number
  itemsFailed: number
  errors: string[]
  duration: number
  status: "completed" | "failed"
}

export async function createIngestionLog(
  sourceType: string,
  sourceId?: string
) {
  return prisma.ingestionLog.create({
    data: {
      sourceType,
      sourceId,
      status: "running",
      startedAt: new Date(),
    },
  })
}

export async function completeIngestionLog(
  logId: string,
  result: IngestionResult
) {
  await prisma.ingestionLog.update({
    where: { id: logId },
    data: {
      status: result.status,
      itemsFound: result.itemsFound,
      itemsCreated: result.itemsCreated,
      itemsUpdated: result.itemsUpdated,
      itemsSkipped: result.itemsSkipped,
      itemsFailed: result.itemsFailed,
      errorCount: result.errors.length,
      errors: result.errors.length > 0 ? JSON.stringify(result.errors) : undefined,
      completedAt: new Date(),
      duration: result.duration,
    },
  })
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

export function qualityScore(stars: number, forks: number, updatedDays: number): number {
  let score = 0
  if (stars > 10000) score += 40
  else if (stars > 1000) score += 30
  else if (stars > 100) score += 20
  else score += 10
  if (forks > 1000) score += 20
  else if (forks > 100) score += 15
  else score += 10
  if (updatedDays < 30) score += 40
  else if (updatedDays < 90) score += 30
  else if (updatedDays < 365) score += 20
  else score += 10
  return score
}

export function classifyTopic(name: string, description: string, topics: string[]): string[] {
  const text = `${name} ${description} ${topics.join(" ")}`.toLowerCase()

  const rules: Record<string, string[]> = {
    "chat-ai": ["chatgpt", "chatbot", "conversation", "gpt", "llm", "dialogue", "assistant"],
    "coding": ["code", "programming", "ide", "compiler", "language model", "copilot", "developer"],
    "image": ["image", "generation", "stable diffusion", "dall-e", "midjourney", "photo", "visual"],
    "video": ["video", "animation", "motion", "frame", "mp4"],
    "voice": ["voice", "speech", "audio", "tts", "text-to-speech", "stt", "whisper"],
    "ai-agents": ["agent", "autonomous", "tool use", "planning", "multi-agent"],
    "automation": ["automation", "workflow", "pipeline", "ci/cd"],
    "education": ["education", "learn", "tutorial", "course", "teaching"],
    "writing": ["writing", "content", "copy", "blog", "article"],
    "productivity": ["productivity", "organize", "note", "calendar", "task"],
    "marketing": ["marketing", "seo", "ad", "campaign", "social media"],
    "business": ["business", "enterprise", "analytics", "dashboard", "report"],
    "open-source": ["open source", "oss", "mit", "apache", "gpl"],
    "local-ai": ["local", "offline", "on-device", "edge", "private"],
    "llms": ["llm", "transformer", "model", "fine-tune", "training", "language model"],
  }

  const categories: string[] = []
  for (const [cat, keywords] of Object.entries(rules)) {
    if (keywords.some((kw) => text.includes(kw))) {
      categories.push(cat)
    }
  }
  return categories.length > 0 ? categories.slice(0, 3) : ["llms"]
}

export async function autoCategorize(name: string, description: string): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return classifyTopic(name, description, [])

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `Categorize this AI tool into 1-3 of: chat-ai, coding, image, video, voice, marketing, writing, productivity, business, education, automation, open-source, local-ai, ai-agents, llms. Return only comma-separated slugs.` },
          { role: "user", content: `${name}: ${description}` },
        ],
        max_tokens: 50,
        temperature: 0.3,
      }),
    })
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || ""
    const cats = text.split(",").map((s: string) => s.trim().toLowerCase()).filter(Boolean)
    if (cats.length > 0) return cats.slice(0, 3)
  } catch {
    logger.warn("Ingestion", "OpenAI categorization failed, using rule-based")
  }
  return classifyTopic(name, description, [])
}

export function extractDomain(url: string): string {
  try { return new URL(url).hostname } catch { return "" }
}

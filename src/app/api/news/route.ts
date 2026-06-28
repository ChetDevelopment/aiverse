import { NextRequest } from "next/server"
import { apiSuccess } from "@/lib/api-utils"

const TOP_STORIES_URL = "https://hacker-news.firebaseio.com/v0/topstories.json"
const ITEM_URL = "https://hacker-news.firebaseio.com/v0/item"
const CACHE_SIZE = 30
const CACHE_TTL = 5 * 60 * 1000

let cache: { data: NewsItem[]; timestamp: number } | null = null

export interface NewsItem {
  id: number
  title: string
  url: string
  points: number
  author: string
  time: number
  timeAgo: string
  source: string
  sourceDomain: string
  thumbnail: string
  commentCount: number
  techScore?: number
}

function timeAgo(timestamp: number): string {
  const s = Math.floor(Date.now() / 1000 - timestamp)
  if (s < 60) return "just now"
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, "") } catch { return "news.ycombinator.com" }
}

function getThumbnail(url: string): string {
  const domain = extractDomain(url)
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
}

const TECH_KEYWORDS = [
  "ai", "artificial intelligence", "machine learning", "llm", "gpt", "chatgpt", "claude",
  "openai", "google", "microsoft", "apple", "meta", "amazon", "nvidia", "tesla",
  "robot", "automation", "deep learning", "neural", "transformer", "model",
  "data", "algorithm", "software", "code", "programming", "startup", "tech",
  "cyber", "security", "cloud", "computer", "digital", "quantum", "chip",
  "semiconductor", "browser", "app", "iphone", "android", "windows", "linux",
  "python", "javascript", "typescript", "rust", "docker", "kubernetes",
  "blockchain", "crypto", "bitcoin", "ethereum", "web3", "vr", "ar",
  "spacex", "nasa", "rocket", "satellite", "electric", "battery", "solar",
  "biotech", "gene", "dna", "health", "medical", "cancer", "drug",
  "github", "open source", "api", "sdk", "framework", "database",
]

function classifyTopic(title: string, source: string): string {
  const t = (title + " " + source).toLowerCase()
  if (t.match(/ai|artificial intelligence|llm|gpt|chatgpt|claude|openai|neural|transformer|machine learning|deep learning/)) return "AI"
  if (t.match(/cyber|security|hack|breach|vulnerability|malware|ransomware/)) return "Security"
  if (t.match(/python|javascript|rust|programming|code|software|developer|app/)) return "Dev"
  if (t.match(/iphone|apple|samsung|google|microsoft|nvidia|intel|amd|chip|semiconductor/)) return "Hardware"
  return "Tech"
}

interface RawHNItem {
  id: number; title?: string; url?: string; score?: number
  by?: string; time?: number; descendants?: number; type?: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const topic = searchParams.get("topic") || "all"
  const refresh = searchParams.get("refresh") === "true"

  if (cache && Date.now() - cache.timestamp < CACHE_TTL && !refresh) {
    const filtered = topic !== "all" ? cache.data.filter((i) => classifyTopic(i.title, i.source).includes(topic)) : cache.data
    return apiSuccess({ items: filtered.slice(0, CACHE_SIZE), cached: true })
  }

  try {
    const idsRes = await fetch(TOP_STORIES_URL, { next: { revalidate: 300 } })
    const allIds: number[] = await idsRes.json()
    const topIds = allIds.slice(0, 100)
    const items: NewsItem[] = []

    for (let i = 0; i < topIds.length; i += 20) {
      const batch = topIds.slice(i, i + 20)
      const results = (await Promise.all(
        batch.map(async (id) => {
          try {
            const res = await fetch(`${ITEM_URL}/${id}.json`)
            return res.ok ? await res.json() as RawHNItem : null
          } catch { return null }
        })
      )).filter(Boolean) as RawHNItem[]

      for (const item of results) {
        if (item.type !== "story" || !item.title || !item.url) continue
        const url = item.url
        const techScore = TECH_KEYWORDS.filter((kw) => (item.title + " " + url).toLowerCase().includes(kw)).length
        items.push({
          id: item.id, title: item.title, url,
          points: item.score || 0, author: item.by || "unknown",
          time: item.time || Math.floor(Date.now() / 1000),
          timeAgo: timeAgo(item.time || Math.floor(Date.now() / 1000)),
          source: extractDomain(url), sourceDomain: extractDomain(url),
          thumbnail: getThumbnail(url),
          commentCount: item.descendants || 0, techScore,
        })
      }
    }

    items.sort((a, b) => ((b.techScore || 0) * 100 + b.points) - ((a.techScore || 0) * 100 + a.points))
    cache = { data: items.slice(0, CACHE_SIZE * 2), timestamp: Date.now() }
    const result = items.slice(0, CACHE_SIZE)
    const filtered = topic !== "all" ? result.filter((i) => classifyTopic(i.title, i.source).includes(topic)) : result
    return apiSuccess({ items: filtered, cached: false })
  } catch {
    if (cache) {
      const filtered = topic !== "all" ? cache.data.filter((i) => classifyTopic(i.title, i.source).includes(topic)) : cache.data
      return apiSuccess({ items: filtered.slice(0, CACHE_SIZE), cached: true })
    }
    return apiSuccess({ items: [] })
  }
}

import { NextRequest } from "next/server"
import { apiSuccess } from "@/lib/api-utils"

let cache: { data: Record<string, unknown[]>; timestamp: number } | null = null
const CACHE_TTL = 30 * 60 * 1000

const QUERIES = [
  { label: "AI/ML", query: "AI+LLM+machine-learning sort:stars-desc stars:>50" },
  { label: "Trending Today", query: "created:>2025-05-01 sort:stars-desc stars:>20" },
  { label: "ChatGPT & LLMs", query: "chatgpt+llm+transformer+language-model sort:stars-desc stars:>50" },
  { label: "Computer Vision", query: "computer-vision+image-generation+object-detection sort:stars-desc stars:>30" },
  { label: "Open Source", query: "open-source+framework+library sort:stars-desc stars:>100" },
  { label: "Startup Tools", query: "startup+saas+productivity sort:stars-desc stars:>20" },
  { label: "DevOps & Cloud", query: "devops+kubernetes+docker+cloud sort:stars-desc stars:>30" },
  { label: "Data Science", query: "data-science+analytics+visualization+database sort:stars-desc stars:>30" },
  { label: "Security", query: "security+cybersecurity+encryption sort:stars-desc stars:>20" },
  { label: "Mobile Apps", query: "mobile+ios+android+react-native+flutter sort:stars-desc stars:>20" },
  { label: "Web Dev", query: "react+nextjs+typescript+tailwind+frontend sort:stars-desc stars:>30" },
  { label: "Blockchain & Web3", query: "blockchain+crypto+web3+defi sort:stars-desc stars:>20" },
  { label: "Robotics", query: "robotics+robot+automation sort:stars-desc stars:>10" },
  { label: "Health & Bio", query: "healthcare+biotech+genomics+drug sort:stars-desc stars:>10" },
  { label: "Gaming", query: "gaming+game-engine+unity+unreal+godot sort:stars-desc stars:>20" },
]

function formatRepo(repo: Record<string, unknown>) {
  const owner = repo.owner as Record<string, unknown> | null
  return {
    name: repo.name, full_name: repo.full_name, description: repo.description,
    stars: repo.stargazers_count, forks: repo.forks_count,
    owner: { login: owner?.login, avatar_url: owner?.avatar_url },
    language: repo.language, topics: repo.topics,
  }
}

async function fetchAll() {
  const token = process.env.GITHUB_TOKEN
  const headers = { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "User-Agent": "AIVerse/1.0" }

  const results = await Promise.all(
    QUERIES.map(async (q) => {
      try {
        const res = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(q.query)}&per_page=10&sort=stars`, { headers })
        if (!res.ok) return { label: q.label, items: [] }
        const data = await res.json()
        return { label: q.label, items: ((data.items || []) as Record<string, unknown>[]).map(formatRepo) }
      } catch { return { label: q.label, items: [] } }
    })
  )

  const data: Record<string, unknown[]> = {}
  for (const r of results) data[r.label] = r.items
  cache = { data, timestamp: Date.now() }
  return data
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const refresh = searchParams.get("refresh") === "true"

  if (cache && Date.now() - cache.timestamp < CACHE_TTL && !refresh) {
    return apiSuccess(cache.data)
  }

  const data = await fetchAll()
  return apiSuccess(data)
}

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const url = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/aiverse"
const adapter = new PrismaPg({ connectionString: url })
const prisma = new PrismaClient({ adapter })

async function searchGitHub() {
  const results: any[] = []
  const queries = [
    "AI OR LLM OR large-language-model stars:>500 pushed:>2025-01-01",
    "machine-learning OR deep-learning stars:>500 pushed:>2025-01-01",
    "agent OR ai-agent OR autonomous-agent stars:>300 pushed:>2025-01-01",
  ]
  const token = process.env.GITHUB_TOKEN
  const headers = { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "User-Agent": "AIVerse/1.0" }

  for (const query of queries) {
    try {
      const res = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=10&sort=stars`, { headers })
      if (!res.ok) continue
      const data: any = await res.json()
      for (const repo of (data.items || [])) {
        if (repo.fork) continue
        results.push({
          repoName: repo.name, repoOwner: repo.owner?.login || "", fullName: repo.full_name,
          githubUrl: repo.html_url, description: repo.description || "",
          stars: repo.stargazers_count || 0, forks: repo.forks_count || 0, watchers: repo.watchers_count || 0,
          language: repo.language, topics: (repo.topics || []).join(", "), license: repo.license?.spdx_id || null,
          category: "AI Tool", lastPushAt: new Date(repo.pushed_at || Date.now()),
          logoUrl: repo.owner?.avatar_url || null, status: "APPROVED",
        })
      }
    } catch {}
  }
  return results
}

async function main() {
  console.log("Searching GitHub for trending AI projects...")
  const repos = await searchGitHub()
  console.log(`Found ${repos.length} repositories`)

  let newCount = 0
  for (const repo of repos) {
    const existing = await prisma.discoveredProject.findUnique({ where: { fullName: repo.fullName } })
    if (!existing) {
      await prisma.discoveredProject.create({ data: repo })
      newCount++
    }
  }

  console.log(`Newly discovered: ${newCount}`)
  const total = await prisma.discoveredProject.count()
  console.log(`Total discovered projects: ${total}`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

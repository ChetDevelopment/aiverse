import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { searchGitHubRepos } from "../src/lib/discovery/github"

const url = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/aiverse"
const adapter = new PrismaPg({ connectionString: url })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Running full category discovery...")
  const { repos, log } = await searchGitHubRepos()
  console.log(`Found ${repos.length} repositories across all categories`)
  
  let newCount = 0
  for (const repo of repos) {
    const existing = await prisma.discoveredProject.findUnique({ where: { fullName: repo.fullName } })
    if (!existing) {
      await prisma.discoveredProject.create({ data: { ...repo, status: "APPROVED" } })
      newCount++
    }
  }

  await prisma.discoveryLog.create({
    data: {
      source: "github",
      query: log.map((l) => l.query).join("; ").slice(0, 1000),
      resultsFound: repos.length,
      newDiscovered: newCount,
      durationMs: 0,
    },
  })

  console.log(`New projects added: ${newCount}`)

  // Count by category
  const projects = await prisma.discoveredProject.findMany({ where: { status: "APPROVED" } })
  const byCat: Record<string, number> = {}
  for (const p of projects) {
    byCat[p.category || "uncategorized"] = (byCat[p.category || "uncategorized"] || 0) + 1
  }
  console.log("\nProjects by category:")
  for (const [cat, count] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`)
  }
  console.log(`\nTotal approved projects: ${projects.length}`)

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

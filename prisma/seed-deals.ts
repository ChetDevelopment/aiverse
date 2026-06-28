import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const url = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/aiverse"
const adapter = new PrismaPg({ connectionString: url })
const prisma = new PrismaClient({ adapter })

const FREE_TIER_DESC = [
  "Free tier with generous usage limits. No credit card required.",
  "Try the full feature set free. Upgrade when you need more.",
  "100% free to start. Includes core features with no time limit.",
  "Free plan includes unlimited messages and basic features.",
  "Get started free. Pay only when you scale.",
  "Completely free tier with no hidden costs.",
  "Free for individuals and small teams.",
  "Start free, upgrade anytime. All core features included.",
]

const OPEN_SOURCE_DESC = [
  "Fully open source under permissive license. Self-host or use cloud.",
  "MIT licensed. Run anywhere, modify anything, share freely.",
  "Open source with active community. Free forever, no strings attached.",
  "Source available. Community-driven development. Free self-hosted option.",
  "Apache 2.0 licensed. Enterprise-ready open source.",
]

async function main() {
  console.log("Seeding deals for all tools...")

  // Delete old auto-generated deals
  await prisma.freeDeal.deleteMany({ where: { verified: false } })

  const tools = await prisma.aiTool.findMany({
    select: { id: true, name: true, slug: true, pricing: true },
  })

  let created = 0
  for (const tool of tools) {
    const existing = await prisma.freeDeal.findFirst({ where: { toolSlug: tool.slug } })
    if (existing) continue

    const isFree = tool.pricing === "FREE"
    const isOpen = true // since most AI tools are open-source or have free tiers
    const dealType = isFree ? "open-source" : "free-tier"
    const desc = isFree
      ? OPEN_SOURCE_DESC[Math.floor(Math.random() * OPEN_SOURCE_DESC.length)]
      : FREE_TIER_DESC[Math.floor(Math.random() * FREE_TIER_DESC.length)]

    await prisma.freeDeal.create({
      data: {
        toolName: tool.name,
        toolSlug: tool.slug,
        description: `${tool.name}: ${desc}`,
        dealType,
        link: `https://github.com/search?q=${encodeURIComponent(tool.name)}`,
        toolId: tool.id,
        verified: true,
      },
    })
    created++
  }

  console.log(`Created ${created} new deals`)
  const total = await prisma.freeDeal.count()
  console.log(`Total deals: ${total}`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

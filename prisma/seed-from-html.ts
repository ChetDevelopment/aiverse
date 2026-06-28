import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, PricingModel } from "@prisma/client"
import { readFileSync } from "fs"
import { join } from "path"

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/aiverse"
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

async function main() {
  console.log("Extracting tools from ai_tools_directory.html...")

  const htmlPath = join(process.cwd(), "ai_tools_directory.html")
  const html = readFileSync(htmlPath, "utf-8")

  const match = html.match(/const TOOLS = \[([\s\S]*?)\];/)
  if (!match) {
    console.error("Could not find TOOLS array in HTML file")
    process.exit(1)
  }

  const toolsData = eval(`[${match[1]}]`) as { n: string; c: string; d: string }[]

  const categoryMap: Record<string, string> = {
    "Chat AI": "chat-ai",
    "Coding": "coding",
    "Image": "image",
    "Video": "video",
    "Voice": "voice",
    "Marketing": "marketing",
    "Writing": "writing",
    "Productivity": "productivity",
    "Business": "business",
    "Education": "education",
    "Automation": "automation",
    "Open Source": "open-source",
    "Local AI": "local-ai",
    "AI Agents": "ai-agents",
    "LLMs": "llms",
  }

  let created = 0
  let skipped = 0

  for (const tool of toolsData) {
    const slug = slugify(tool.n)
    if (!slug) { skipped++; continue }

    const catSlug = categoryMap[tool.c]
    if (!catSlug) { skipped++; continue }

    const existing = await prisma.aiTool.findUnique({ where: { slug } })
    if (existing) { skipped++; continue }

    const category = await prisma.category.findUnique({ where: { slug: catSlug } })
    if (!category) { skipped++; continue }

    const pricing: PricingModel = tool.d.toLowerCase().includes("free") && tool.d.toLowerCase().includes("paid")
      ? "FREEMIUM"
      : tool.d.toLowerCase().includes("free")
        ? "FREE"
        : tool.d.toLowerCase().includes("paid") || tool.d.toLowerCase().includes("premium")
          ? "PAID"
          : "FREEMIUM"

    const domain = tool.n.toLowerCase().replace(/[^a-z0-9]/g, "") + ".ai"

    try {
      await prisma.aiTool.create({
        data: {
          name: tool.n,
          slug,
          tagline: tool.d.slice(0, 90),
          description: tool.d,
          websiteUrl: `https://${domain}`,
          pricing,
          isPublished: true,
          isFeatured: false,
          categories: { create: { categoryId: category.id } },
        },
      })
      created++
    } catch {
      skipped++
    }
  }

  console.log(`Created ${created} tools, skipped ${skipped} (${created + skipped} total)`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

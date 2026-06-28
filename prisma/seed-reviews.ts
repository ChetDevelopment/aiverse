import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const url = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/aiverse"
const adapter = new PrismaPg({ connectionString: url })
const prisma = new PrismaClient({ adapter })

const REVIEWS = [
  { r: 5, c: "Excellent tool! Highly recommend for anyone looking to boost productivity." },
  { r: 5, c: "Game changer for my workflow. Can't imagine working without it now." },
  { r: 4, c: "Really solid tool with great features. A few minor improvements would make it perfect." },
  { r: 4, c: "Good value for the price. Does what it promises reliably." },
  { r: 5, c: "Best in class for this category. The accuracy and speed are impressive." },
  { r: 4, c: "Very useful tool, intuitive interface, and responsive support team." },
  { r: 3, c: "Decent tool but there are better alternatives available. Does the basics well." },
  { r: 5, c: "Absolutely love this! Saved us hours of manual work every week." },
  { r: 4, c: "Powerful features and regular updates. The team is clearly committed to improving it." },
  { r: 5, c: "Outstanding quality and performance. Worth every penny." },
  { r: 4, c: "Great for beginners and experts alike. The documentation is excellent." },
  { r: 3, c: "It works well but the learning curve is steeper than expected." },
  { r: 5, c: "Transformed how our team operates. Incredible ROI." },
  { r: 4, c: "Solid performance and great integration with other tools we use." },
  { r: 5, c: "The open-source community behind this is amazing. Constantly improving." },
  { r: 4, c: "Clean UI, fast performance, and reliable results. Highly recommended." },
  { r: 5, c: "This tool is a must-have for anyone in this space. Truly excellent." },
  { r: 4, c: "Very impressed with the quality. Does exactly what it promises." },
  { r: 3, c: "Good start but needs more features to compete with established options." },
  { r: 5, c: "Simply the best option out there. Tried many alternatives, this wins." },
]

const USERS = [
  "TechReview2024", "AIPowerUser", "DevOpsExpert", "DataScientistPro",
  "MLEnthusiast", "CodeNinja", "PixelPerfect", "CloudArchitect",
  "StartupFounder", "DigitalCreator", "OpenSourceFan", "AIDeveloper",
  "ProductManagerX", "UXDesignerPro", "FullStackDev",
]

async function main() {
  console.log("Seeding reviews for all tools...")
  const tools = await prisma.aiTool.findMany({ select: { id: true } })
  const existingUsers = await prisma.user.findMany({ select: { id: true } })

  let count = 0
  for (const tool of tools) {
    const existingCount = await prisma.review.count({ where: { toolId: tool.id } })
    if (existingCount > 0) continue

    // Add 2-5 random reviews per tool
    const numReviews = 2 + Math.floor(Math.random() * 4)
    const shuffled = [...REVIEWS].sort(() => Math.random() - 0.5).slice(0, numReviews)

    for (const review of shuffled) {
      // Use existing user or create anonymous review
      const user = existingUsers.length > 0
        ? existingUsers[Math.floor(Math.random() * existingUsers.length)]
        : null

      const uid = user?.id || `anon_${tool.id}_${count}`
      await prisma.review.upsert({
        where: { userId_toolId: { userId: uid, toolId: tool.id } },
        update: { rating: review.r, comment: review.c },
        create: { rating: review.r, comment: review.c, userId: uid, toolId: tool.id },
      })
      count++
    }
  }

  console.log(`Created ${count} reviews`)
  const total = await prisma.review.count()
  console.log(`Total reviews in database: ${total}`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

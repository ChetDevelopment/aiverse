import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const url = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/aiverse"
const adapter = new PrismaPg({ connectionString: url })
const prisma = new PrismaClient({ adapter })

async function main() {
  const approved = await prisma.discoveredProject.count({ where: { status: "APPROVED" } })
  const total = await prisma.discoveredProject.count()
  const tools = await prisma.aiTool.count()
  const prompts = await prisma.prompt.count()
  const users = await prisma.user.count()
  console.log(`Users: ${users}`)
  console.log(`AI Tools: ${tools}`)
  console.log(`Prompts: ${prompts}`)
  console.log(`Discovered Projects (total): ${total}`)
  console.log(`Discovered Projects (approved): ${approved}`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

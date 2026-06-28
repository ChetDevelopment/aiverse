import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

async function main() {
  const url = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/aiverse"
  const adapter = new PrismaPg({ connectionString: url })
  const prisma = new PrismaClient({ adapter })

  const user = await prisma.user.findUnique({ where: { email: "admin@aiverse.ai" } })
  if (!user) {
    console.log("ERROR: Admin user not found in database!")
    console.log("Run: npx tsx scripts/create-local-admin.ts")
    await prisma.$disconnect()
    return
  }

  console.log("Admin found:")
  console.log("  Email:", user.email)
  console.log("  Role:", user.role)
  console.log("  Hash exists:", !!user.passwordHash)

  if (user.passwordHash) {
    const match = await bcrypt.compare("Admin@123", user.passwordHash)
    console.log("  Password correct:", match)
  }

  const toolCount = await prisma.aiTool.count()
  console.log("  Tools in DB:", toolCount)

  const dealCount = await prisma.freeDeal.count()
  console.log("  Deals in DB:", dealCount)

  await prisma.$disconnect()
}

main()

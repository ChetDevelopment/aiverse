import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

async function main() {
  const url = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/aiverse"
  const adapter = new PrismaPg({ connectionString: url })
  const prisma = new PrismaClient({ adapter })

  const email = process.argv[2] || "admin@aiverse.ai"
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    console.log(`User not found: ${email}`)
    console.log("Available users:")
    const users = await prisma.user.findMany({ take: 20 })
    users.forEach((u) => console.log(`  ${u.email} | Role: ${u.role} | ID: ${u.id}`))
    await prisma.$disconnect()
    return
  }

  await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } })
  console.log(`Upgraded ${user.email} to ADMIN`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

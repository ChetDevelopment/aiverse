import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

async function main() {
  const url = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/aiverse"
  const adapter = new PrismaPg({ connectionString: url })
  const prisma = new PrismaClient({ adapter })

  await prisma.user.deleteMany({ where: { email: "admin@aiverse.ai" } })
  console.log("Deleted old admin user.")
  console.log("Now register at http://localhost:3000/register")
  console.log("You will be the first user = automatic ADMIN")

  await prisma.$disconnect()
}

main().catch(console.error)

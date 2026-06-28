import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

async function main() {
  const url = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/aiverse"
  const adapter = new PrismaPg({ connectionString: url })
  const prisma = new PrismaClient({ adapter })

  const email = "admin@aiverse.ai"
  const password = "Admin@123"
  const hash = await bcrypt.hash(password, 10)

  // Delete old user if exists
  await prisma.user.deleteMany({ where: { email } })

  await prisma.user.create({
    data: {
      email,
      name: "Admin",
      role: "ADMIN",
      passwordHash: hash,
    },
  })

  console.log("Admin account created!")
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}`)
  console.log("\nLogin at http://localhost:3000/login")

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

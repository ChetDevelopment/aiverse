import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

async function main() {
  const url = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/aiverse"
  const adapter = new PrismaPg({ connectionString: url })
  const prisma = new PrismaClient({ adapter })

  const existing = await prisma.user.findUnique({ where: { email: "admin@aiverse.ai" } })
  if (existing) {
    console.log(`Admin exists: ${existing.email}, Role: ${existing.role}`)
    if (existing.role !== "ADMIN") {
      await prisma.user.update({ where: { id: existing.id }, data: { role: "ADMIN" } })
      console.log("Upgraded to ADMIN")
    }
  } else {
    const admin = await prisma.user.create({
      data: { email: "admin@aiverse.ai", name: "Admin", role: "ADMIN" },
    })
    console.log(`Admin created: ${admin.email}, ID: ${admin.id}`)
  }

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

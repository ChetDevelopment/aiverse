import { prisma } from "../src/lib/prisma"
async function main() {
  const total = await prisma.discoveredProject.count()
  const approved = await prisma.discoveredProject.count({ where: { status: "APPROVED" } })
  const pending = await prisma.discoveredProject.count({ where: { status: "PENDING" } })
  console.log("Total:", total, "Approved:", approved, "Pending:", pending)
}
main()

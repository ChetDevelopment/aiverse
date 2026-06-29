import { prisma } from "../src/lib/prisma"
const ADMIN_EMAILS = ["vichet.sat@student.passerellesnumeriques.org", "ka383768@gmail.com", "admin@aiverse.ai", "admin@aiverse.com"]
async function main() {
  for (const email of ADMIN_EMAILS) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (user) {
      await prisma.user.update({ where: { email }, data: { role: "ADMIN" } })
      console.log(`Upgraded ${email} to ADMIN`)
    }
  }
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { email: true, role: true } })
  console.log("Admins:", admins.map(a => a.email).join(", "))
}
main().catch(console.error)

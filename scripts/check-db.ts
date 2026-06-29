import { prisma } from "../src/lib/prisma"
async function main() {
  const total = await prisma.aiTool.count()
  const published = await prisma.aiTool.count({ where: { isPublished: true } })
  const prompts = await prisma.prompt.count()
  const users = await prisma.user.count()
  const workspaces = await prisma.workspace.count()
  console.log("Total tools:", total, "Published:", published, "Prompts:", prompts, "Users:", users, "Workspaces:", workspaces)
}
main().catch((e) => { console.error(e); process.exit(1) })

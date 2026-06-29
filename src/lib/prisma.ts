import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma

  const url = process.env.DATABASE_URL
  if (url) {
    try {
      const adapter = new PrismaPg({ connectionString: url })
      const client = new PrismaClient({ adapter })
      globalForPrisma.prisma = client
      return client
    } catch (e) {
      console.error("[PRISMA] Adapter failed:", (e as Error)?.message)
    }
  }

  const returns: Record<string, unknown> = {
    findMany: [], findUnique: null, findFirst: null,
    count: 0, aggregate: { _sum: { viewCount: 0 } },
    create: {}, update: {}, upsert: {}, delete: {},
    deleteMany: {}, updateMany: {},
  }
  const modelHandler = {
    get(_t: unknown, method: string) {
      if (method === "then") return undefined
      const val = returns[method]
      return val !== undefined ? () => Promise.resolve(val) : () => Promise.resolve(null)
    },
  }
  return new Proxy({} as Record<string, unknown>, {
    get(_t: unknown, prop: string) {
      if (prop === "then" || ["$connect", "$disconnect", "$on", "$transaction", "$use"].includes(prop)) return undefined
      return new Proxy({} as Record<string, unknown>, modelHandler)
    },
  }) as unknown as PrismaClient
}

export const prisma = getPrisma()

import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function initPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma

  const url = process.env.DATABASE_URL
  if (url) {
    const client = new PrismaClient()
    globalForPrisma.prisma = client
    return client
  }

  console.warn("DATABASE_URL not set — returning empty data")
  return new PrismaClient()
}

export const prisma = initPrisma()

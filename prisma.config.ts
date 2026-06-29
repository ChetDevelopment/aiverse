import { defineConfig } from "@prisma/config"

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_EPhASU9mK6wt@ep-tiny-firefly-ai6i1ws1-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require",
  },
  schema: "prisma/schema.prisma",
})

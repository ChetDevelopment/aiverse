import Link from "next/link"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
}

export default async function AdminDashboardPage() {
  const [toolCount, categoryCount, userCount, reviewCount] =
    await Promise.all([
      prisma.aiTool.count(),
      prisma.category.count(),
      prisma.user.count(),
      prisma.review.count(),
    ])

  const recentTools = await prisma.aiTool.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { name: true, slug: true, createdAt: true, isPublished: true },
  })

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your AI tools directory
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-medium">
                Total Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{toolCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-medium">
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{categoryCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-medium">
                Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{userCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-medium">
                Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{reviewCount}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTools.map((tool) => (
                  <div
                    key={tool.slug}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <Link
                        href={`/ai-tool/${tool.slug}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {tool.name}
                      </Link>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        tool.isPublished
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {tool.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                ))}
                {recentTools.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No tools added yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/admin/tools/new"
                  className="flex items-center justify-center rounded-lg border p-4 text-sm font-medium hover:bg-accent transition-colors"
                >
                  Add Tool
                </Link>
                <Link
                  href="/admin/categories"
                  className="flex items-center justify-center rounded-lg border p-4 text-sm font-medium hover:bg-accent transition-colors"
                >
                  Categories
                </Link>
                <Link
                  href="/admin/users"
                  className="flex items-center justify-center rounded-lg border p-4 text-sm font-medium hover:bg-accent transition-colors"
                >
                  Users
                </Link>
                <a
                  href={`${process.env.NEXT_PUBLIC_SUPABASE_URL || ""}/project/default/editor`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-lg border p-4 text-sm font-medium hover:bg-accent transition-colors"
                >
                  Database
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

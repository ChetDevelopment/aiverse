import { prisma } from "@/lib/prisma"
import { StatsGrid, TopToolsChart, WeeklyTrend } from "@/components/admin/analytics-charts"

export const dynamic = "force-dynamic"

export default async function AdminAnalyticsPage() {
  const [totalTools, totalUsers, totalReviews, totalViews, totalFavorites] = await Promise.all([
    prisma.aiTool.count(),
    prisma.user.count(),
    prisma.review.count(),
    prisma.aiTool.aggregate({ _sum: { viewCount: true } }),
    prisma.favorite.count(),
  ])

  const topTools = await prisma.aiTool.findMany({
    where: { isPublished: true },
    orderBy: { viewCount: "desc" },
    take: 10,
    select: { name: true, slug: true, viewCount: true, _count: { select: { reviews: true } } },
  })

  const recentHistory = await prisma.history.findMany({
    orderBy: { createdAt: "desc" },
    take: 1000,
    select: { createdAt: true },
  })

  const now = new Date()
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const weeklyData = dayNames.map((name) => {
    const day = now.getDay()
    const idx = dayNames.indexOf(name)
    const diff = (idx - day + 7) % 7
    const target = new Date(now)
    target.setDate(target.getDate() + diff)
    const count = recentHistory.filter((h) => {
      const hd = new Date(h.createdAt)
      return hd.toDateString() === target.toDateString()
    }).length
    return { label: name, value: count }
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      <StatsGrid
        data={{
          tools: totalTools,
          users: totalUsers,
          views: totalViews._sum.viewCount || 0,
          favorites: totalFavorites,
          reviews: totalReviews,
        }}
      />

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <TopToolsChart
          tools={topTools.map((t) => ({
            name: t.name,
            slug: t.slug,
            value: t.viewCount,
            secondary: `${t._count.reviews} reviews`,
          }))}
        />
        <WeeklyTrend data={weeklyData} />
      </div>
    </div>
  )
}

import { redirect } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, Bookmark, Star, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Profile", robots: { index: false, follow: false } }
export const dynamic = "force-dynamic"

const SESSION_COOKIES = ["aiverse_local_session", "aiverse_google_session", "aiverse_github_session"]

function parseSession(value: string) {
  try { return JSON.parse(Buffer.from(value, "base64").toString()) as { id: string; email: string; role?: string } }
  catch { return null }
}

async function getUserId(): Promise<string | null> {
  // Try Supabase first
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.id) return user.id

  // Fallback: check custom session cookies
  try {
    const store = await cookies()
    for (const name of SESSION_COOKIES) {
      const cookie = store.get(name)
      if (cookie?.value) {
        const data = parseSession(cookie.value)
        if (data?.id) return data.id
      }
    }
  } catch {}
  return null
}

export default async function ProfilePage() {
  const userId = await getUserId()
  if (!userId) redirect("/login")

  const [dbUser, favorites, bookmarks, reviews] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.favorite.findMany({ where: { userId }, include: { tool: { select: { name: true, slug: true, tagline: true } } }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.bookmark.findMany({ where: { userId }, include: { tool: { select: { name: true, slug: true } } }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.review.findMany({ where: { userId }, include: { tool: { select: { name: true, slug: true } } }, orderBy: { createdAt: "desc" }, take: 10 }),
  ])

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">{dbUser?.name?.charAt(0) || dbUser?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{dbUser?.name || "User"}</h1>
            <p className="text-muted-foreground">{dbUser?.email || ""}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">{dbUser?.role}</Badge>
            <form action="/api/auth/logout" method="POST">
              <Button variant="outline" size="sm" type="submit"><LogOut className="mr-2 h-4 w-4" />Sign Out</Button>
            </form>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link href="/saved?tab=favorites">
            <Card className="p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-primary" />
                <div><p className="font-medium">Favorites</p><p className="text-sm text-muted-foreground">{favorites.length} tools</p></div>
              </div>
            </Card>
          </Link>
          <Link href="/saved?tab=bookmarks">
            <Card className="p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <Bookmark className="h-5 w-5 text-primary" />
                <div><p className="font-medium">Bookmarks</p><p className="text-sm text-muted-foreground">{bookmarks.length} tools</p></div>
              </div>
            </Card>
          </Link>
          <Link href="/saved?tab=history">
            <Card className="p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-primary" />
                <div><p className="font-medium">Reviews</p><p className="text-sm text-muted-foreground">{reviews.length} reviews</p></div>
              </div>
            </Card>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Recent Favorites</CardTitle></CardHeader>
            <CardContent>
              {favorites.length > 0 ? <ul className="space-y-2">{favorites.map((f) => <li key={f.id}><Link href={`/ai-tool/${f.tool.slug}`} className="text-sm hover:text-primary">{f.tool.name}</Link><p className="text-xs text-muted-foreground">{f.tool.tagline}</p></li>)}</ul>
                : <p className="text-sm text-muted-foreground">No favorites yet. Browse tools and save your favorites!</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Recent Reviews</CardTitle></CardHeader>
            <CardContent>
              {reviews.length > 0 ? <ul className="space-y-2">{reviews.map((r) => <li key={r.id}><Link href={`/ai-tool/${r.tool.slug}`} className="text-sm hover:text-primary">{r.tool.name}</Link><p className="text-xs text-muted-foreground">Rating: {r.rating}/5</p></li>)}</ul>
                : <p className="text-sm text-muted-foreground">No reviews yet.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

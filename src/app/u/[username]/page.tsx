import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

interface Props { params: Promise<{ username: string }> }

export const dynamic = "force-dynamic"

export default async function PublicUserPage({ params }: Props) {
  const { username } = await params
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: username },
        { name: username },
      ],
    },
  })

  if (!user) notFound()

  const [reviews, collections] = await Promise.all([
    prisma.review.findMany({
      where: { userId: user.id },
      include: { tool: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.collection.findMany({
      where: { userId: user.id, public: true },
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ])

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">{user.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.name || "Anonymous User"}</h1>
            <p className="text-muted-foreground text-sm">Member since {user.createdAt.toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-5">
              <h2 className="font-semibold mb-3">Reviews ({reviews.length})</h2>
              {reviews.length > 0 ? (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div key={r.id} className="flex items-center justify-between">
                      <Link href={`/ai-tool/${r.tool.slug}`} className="text-sm hover:text-primary">{r.tool.name}</Link>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">No reviews yet.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="font-semibold mb-3">Collections ({collections.length})</h2>
              {collections.length > 0 ? (
                <div className="space-y-2">
                  {collections.map((c) => (
                    <Link key={c.id} href={`/collections/${c.slug}`} className="flex items-center justify-between text-sm hover:text-primary">
                      <span>{c.name}</span>
                      <Badge variant="secondary" className="text-[10px]">{c._count.items} tools</Badge>
                    </Link>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">No public collections.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } }, tool: { select: { name: true, slug: true } } },
    take: 100,
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reviews</h1>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {reviews.map((review) => (
              <div key={review.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{review.tool.name}</p>
                    <p className="text-sm text-muted-foreground">by {review.user.name || review.user.email}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                </div>
                {review.comment && <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>}
              </div>
            ))}
            {reviews.length === 0 && <p className="px-6 py-8 text-sm text-muted-foreground text-center">No reviews yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

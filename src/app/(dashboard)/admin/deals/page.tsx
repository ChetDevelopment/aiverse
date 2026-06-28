import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export default async function AdminDealsPage() {
  const deals = await prisma.freeDeal.findMany({
    orderBy: { createdAt: "desc" },
    include: { tool: { select: { name: true } } },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Free Deals</h1>
        <Link href="/admin/deals/new"><Button>New Deal</Button></Link>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {deals.map((deal) => (
              <div key={deal.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium">{deal.toolName}</p>
                  <p className="text-sm text-muted-foreground">{deal.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={deal.verified ? "success" : "secondary"}>
                    {deal.verified ? "Verified" : "Pending"}
                  </Badge>
                  <Badge variant="outline">{deal.dealType}</Badge>
                </div>
              </div>
            ))}
            {deals.length === 0 && <p className="px-6 py-8 text-sm text-muted-foreground text-center">No deals yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

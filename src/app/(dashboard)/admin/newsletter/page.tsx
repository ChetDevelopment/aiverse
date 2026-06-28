import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export default async function AdminNewsletterPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Newsletter Subscribers</h1>
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{subscribers.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{subscribers.filter(s => s.active).length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Inactive</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{subscribers.filter(s => !s.active).length}</p></CardContent></Card>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {subscribers.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between px-6 py-3">
                <span className="text-sm">{sub.email}</span>
                <div className="flex items-center gap-3">
                  <Badge variant={sub.active ? "success" : "secondary"}>{sub.active ? "Active" : "Inactive"}</Badge>
                  <span className="text-xs text-muted-foreground">{sub.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

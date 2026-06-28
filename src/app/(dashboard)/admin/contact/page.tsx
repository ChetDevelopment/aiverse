import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export default async function AdminContactPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Contact Messages</h1>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {messages.map((msg) => (
              <div key={msg.id} className="px-6 py-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{msg.name}</p>
                    <p className="text-sm text-muted-foreground">{msg.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={msg.read ? "secondary" : "default"}>
                      {msg.read ? "Read" : "New"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {msg.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{msg.message}</p>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="px-6 py-8 text-sm text-muted-foreground text-center">No messages yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

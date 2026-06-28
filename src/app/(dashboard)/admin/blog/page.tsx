import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Link href="/admin/blog/new"><Button>New Post</Button></Link>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex-1">
                  <Link href={`/blog/${post.slug}`} className="font-medium hover:text-primary">{post.title}</Link>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span>{post.author}</span>
                    <span>·</span>
                    <span>{post.readTime} min</span>
                    <span>·</span>
                    <span>{post.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={post.published ? "success" : "secondary"}>{post.published ? "Published" : "Draft"}</Badge>
                  {post.featured && <Badge>Featured</Badge>}
                  <Link href={`/admin/blog/${post.id}/edit`} className="text-xs text-muted-foreground hover:text-primary ml-2">Edit</Link>
                </div>
              </div>
            ))}
            {posts.length === 0 && <p className="px-6 py-8 text-sm text-muted-foreground text-center">No posts yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import Link from "next/link"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Blog & Guides",
  description: "AI guides, tutorials, and insights. Learn how to get the most out of AI tools.",
}

export const revalidate = 300

interface Props {
  searchParams: Promise<{ tool?: string }>
}

export default async function BlogPage({ searchParams }: Props) {
  const { tool } = await searchParams

  const where = tool
    ? { published: true, tags: { contains: `tool:${tool}` } }
    : { published: true }

  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  const featured = tool ? null : posts.find((p) => p.featured)
  const toolName = tool ? tool.replace(/-/g, " ") : null

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          {toolName ? (
            <div className="flex items-center gap-3 mb-2">
              <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-3xl font-bold tracking-tight capitalize">{toolName} Guides</h1>
            </div>
          ) : (
            <h1 className="text-3xl font-bold tracking-tight">Blog & Guides</h1>
          )}
          <p className="mt-2 text-muted-foreground">
            {toolName
              ? `Setup guides, tutorials, and tips for ${toolName}.`
              : "AI guides, tutorials, and insights to help you get the most out of AI tools."}
          </p>
        </div>

        {featured && (
          <Link href={`/blog/${featured.slug}`}>
            <Card className="mb-10 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6 sm:p-8">
                <Badge className="mb-3">Featured</Badge>
                <h2 className="text-2xl font-bold mb-2">{featured.title}</h2>
                <p className="text-muted-foreground mb-4">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{featured.createdAt.toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{featured.readTime} min read</span>
                  <span>By {featured.author}</span>
                </div>
              </div>
            </Card>
          </Link>
        )}

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">No guides yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Check back soon for new content.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(featured ? posts.filter((p) => p.id !== featured.id) : posts).map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    {post.tags && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {post.tags.split(",").filter((t) => t.startsWith("tool:")).map((tag) => (
                          <span key={tag} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                            {tag.replace("tool:", "")}
                          </span>
                        ))}
                      </div>
                    )}
                    <h3 className="font-semibold mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{post.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{post.createdAt.toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime} min</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

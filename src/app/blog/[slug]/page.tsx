import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { Calendar, Clock, ArrowLeft } from "lucide-react"

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({ where: { slug } })
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt || post.content.slice(0, 160),
    openGraph: { title: post.title, description: post.excerpt || post.content.slice(0, 160) },
    alternates: { canonical: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/blog/${slug}` },
  }
}

export const revalidate = 300

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({ where: { slug, published: true } })
  if (!post) notFound()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Person", name: post.author },
    datePublished: post.createdAt.toISOString(),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />
          <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to blog
          </Link>

          <article>
            <header className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span>By {post.author}</span>
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{post.createdAt.toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{post.readTime} min read</span>
              </div>
            </header>

            {post.coverImage && (
              <div className="relative aspect-video rounded-xl overflow-hidden mb-8 bg-secondary">
                <Image src={post.coverImage} alt={post.title} fill className="object-cover" unoptimized sizes="(max-width: 768px) 100vw, 768px" />
              </div>
            )}

            <div className="prose prose-gray dark:prose-invert max-w-none leading-relaxed whitespace-pre-wrap text-muted-foreground">
              {post.content}
            </div>

            {post.tags && (
              <div className="mt-8 flex flex-wrap gap-2">
                {post.tags.split(",").map((tag) => (
                  <span key={tag} className="text-xs bg-secondary px-2 py-1 rounded-full text-muted-foreground">{tag.trim()}</span>
                ))}
              </div>
            )}
          </article>
        </div>
      </div>
    </>
  )
}

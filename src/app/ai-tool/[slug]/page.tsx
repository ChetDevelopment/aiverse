import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { ShareButton } from "@/components/shared/share-button"
import { ToolActions } from "@/components/ai-tool/tool-actions"
import { ReviewForm } from "@/components/ai-tool/review-form"
import { RelatedTools } from "@/components/shared/related-tools"
import { ToolGuides } from "@/components/shared/tool-guides"
import { OfficialPrompts } from "@/components/prompts/official-prompts"
import { ContentRelationships } from "@/components/shared/content-relationships"
import { StarRating } from "@/components/shared/star-rating"
import {
  ExternalLink,
  Check,
  X,
  Globe,
} from "lucide-react"

export const revalidate = 300

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tool = await prisma.aiTool.findUnique({
    where: { slug },
    select: { name: true, tagline: true, description: true },
  })

  if (!tool) return {}

  return {
    title: tool.name,
    description: tool.tagline || tool.description.slice(0, 160),
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/ai-tool/${slug}`,
    },
    openGraph: {
      title: `${tool.name} — AIVerse`,
      description: tool.tagline || tool.description.slice(0, 160),
    },
  }
}

export default async function AiToolPage({ params }: Props) {
  const { slug } = await params

  const tool = await prisma.aiTool.findUnique({
    where: { slug, isPublished: true },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      pros: true,
      cons: true,
      screenshots: { orderBy: { order: "asc" } },
      reviews: {
        include: { user: { select: { name: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
      },
      faqs: { orderBy: { order: "asc" } },
      alternatives: {
        include: {
          alternative: {
            select: {
              id: true,
              name: true,
              slug: true,
              tagline: true,
              logo: true,
              pricing: true,
              reviews: { select: { rating: true } },
            },
          },
        },
      },
      _count: { select: { favorites: true, bookmarks: true } },
    },
  })

  if (!tool) {
    notFound()
  }

  // Increment view count for every visitor (guest + authenticated)
  await prisma.aiTool.update({
    where: { id: tool.id },
    data: { viewCount: { increment: 1 } },
  })

  const avgRating =
    tool.reviews.length > 0
      ? tool.reviews.reduce((acc, r) => acc + r.rating, 0) / tool.reviews.length
      : 0

  const pricingColor = {
    FREE: "success" as const,
    FREEMIUM: "warning" as const,
    PAID: "default" as const,
    CONTACT: "secondary" as const,
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.tagline || tool.description,
    url: tool.websiteUrl,
    applicationCategory: tool.categories.map((c) => c.category.name).join(", "),
    offers: {
      "@type": "Offer",
      price:
        tool.pricing === "FREE"
          ? "0"
          : tool.pricing === "PAID"
            ? tool.startingPrice?.toString() || "Varies"
            : "Varies",
      priceCurrency: "USD",
    },
    aggregateRating:
      avgRating > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount: tool.reviews.length,
          }
        : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[
            ...(tool.categories[0] ? [{ label: tool.categories[0].category.name, href: `/categories/${tool.categories[0].category.slug}` }] : []),
            { label: tool.name },
          ]} />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-start gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border bg-secondary text-2xl font-bold text-primary overflow-hidden">
                  {tool.logo ? (
                    <Image src={tool.logo} alt={tool.name} width={64} height={64} className="object-contain p-1.5" />
                  ) : (
                    tool.name.charAt(0)
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">
                      {tool.name}
                    </h1>
                    <Badge variant={pricingColor[tool.pricing]}>
                      {tool.pricing === "FREE"
                        ? "Free"
                        : tool.pricing === "FREEMIUM"
                          ? "Freemium"
                          : tool.pricing === "PAID"
                            ? "Paid"
                            : "Contact"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-lg text-muted-foreground">
                    {tool.tagline}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    {avgRating > 0 && (
                      <div className="flex items-center gap-2">
                        <StarRating rating={avgRating} size="lg" showNumeric />
                        <span className="text-sm font-medium">
                          {avgRating.toFixed(1)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({tool.reviews.length} reviews)
                        </span>
                      </div>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {tool.viewCount.toLocaleString()} views
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href={tool.websiteUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="lg">
                    <Globe className="mr-2 h-4 w-4" />
                    Visit Website
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <ToolActions toolId={tool.id} />
              </div>

              <ShareButton title={tool.name} url={`/ai-tool/${tool.slug}`} />

              <Separator />

              <div>
                <h2 className="text-xl font-semibold mb-3">About</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {tool.description}
                </p>
              </div>

              {tool.categories.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Categories</h2>
                  <div className="flex flex-wrap gap-2">
                    {tool.categories.map((tc) => (
                      <Link key={tc.category.slug} href={`/categories/${tc.category.slug}`}>
                        <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                          {tc.category.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {tool.tags.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {tool.tags.map((tt) => (
                      <Badge key={tt.tag.slug} variant="outline">
                        {tt.tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {tool.screenshots.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Screenshots</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {tool.screenshots.map((screenshot) => (
                      <div
                        key={screenshot.id}
                        className="relative aspect-video rounded-xl border bg-secondary overflow-hidden"
                      >
                        <Image
                          src={screenshot.url}
                          alt={screenshot.alt || `${tool.name} screenshot`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-6">
                {tool.pros.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Check className="h-5 w-5 text-emerald-500" />
                      Pros
                    </h2>
                    <ul className="space-y-2">
                      {tool.pros.map((pro) => (
                        <li
                          key={pro.id}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          {pro.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {tool.cons.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <X className="h-5 w-5 text-destructive" />
                      Cons
                    </h2>
                    <ul className="space-y-2">
                      {tool.cons.map((con) => (
                        <li
                          key={con.id}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                          {con.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {tool.faqs.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">FAQ</h2>
                  <div className="space-y-4">
                    {tool.faqs.map((faq) => (
                      <div
                        key={faq.id}
                        className="rounded-lg border p-4"
                      >
                        <h3 className="font-medium">{faq.question}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <ReviewForm toolId={tool.id} />

              {tool.reviews.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">
                    Reviews ({tool.reviews.length})
                  </h2>
                  <div className="space-y-4">
                    {tool.reviews.map((review) => (
                      <div key={review.id} className="rounded-lg border p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold">
                            {review.user.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {review.user.name || "Anonymous"}
                            </p>
                            <StarRating rating={review.rating} size="sm" />
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground ml-11">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Pricing</p>
                    <p className="font-semibold mt-1">
                      {tool.pricing === "FREE"
                        ? "Free"
                        : tool.pricing === "FREEMIUM"
                          ? "Freemium"
                          : tool.pricing === "PAID"
                            ? `Paid${tool.startingPrice ? ` — from $${tool.startingPrice}` : ""}`
                            : "Contact for pricing"}
                    </p>
                    {tool.pricingDetail && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {tool.pricingDetail}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={avgRating} />
                      <span className="font-semibold">
                        {avgRating > 0 ? avgRating.toFixed(1) : "No ratings"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tool.reviews.length} review{tool.reviews.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Favorites</span>
                    <span className="font-medium">
                      {tool._count.favorites}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Views</span>
                    <span className="font-medium">
                      {tool.viewCount.toLocaleString()}
                    </span>
                  </div>

                  <Link href={tool.websiteUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Visit Website
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <RelatedTools currentToolId={tool.id} categoryId={tool.categories[0]?.category.id} />

              <ToolGuides toolSlug={tool.slug} />

              <OfficialPrompts toolId={tool.id} toolSlug={tool.slug} />

              <ContentRelationships type="tool" slug={tool.slug} />

              {tool.alternatives.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Alternatives</h3>
                    <div className="space-y-3">
                      {tool.alternatives.map((alt) => {
                        const altRating =
                          alt.alternative.reviews.length > 0
                            ? alt.alternative.reviews.reduce(
                                (acc, r) => acc + r.rating,
                                0
                              ) / alt.alternative.reviews.length
                            : 0
                        return (
                          <Link
                            key={alt.id}
                            href={`/ai-tool/${alt.alternative.slug}`}
                            className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent transition-colors"
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-secondary text-sm font-bold text-primary overflow-hidden">
                              {alt.alternative.logo ? (
                                <Image src={alt.alternative.logo} alt={alt.alternative.name} width={36} height={36} className="object-contain p-0.5" />
                              ) : (
                                alt.alternative.name.charAt(0)
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {alt.alternative.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {alt.alternative.tagline}
                              </p>
                            </div>
                            {altRating > 0 && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <StarRating rating={altRating} size="sm" />
                              </div>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

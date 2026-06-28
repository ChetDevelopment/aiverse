"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, ExternalLink, MessageCircle, TrendingUp, Clock, Newspaper, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface ArticleData {
  title: string
  url: string
  points: number
  author: string
  time: number
  commentCount: number
  text?: string
}

interface ContentData {
  title: string
  excerpt: string
  content: string
  paragraphs: string[]
  textContent: string
  byline: string
  siteName: string
}

export default function NewsArticlePage() {
  const { id } = useParams<{ id: string }>()
  const [article, setArticle] = useState<ArticleData | null>(null)
  const [content, setContent] = useState<ContentData | null>(null)
  const [loadingArticle, setLoadingArticle] = useState(true)
  const [loadingContent, setLoadingContent] = useState(true)
  const [contentError, setContentError] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
      .then((r) => r.json())
      .then((data) => {
        setArticle({
          title: data.title || "",
          url: data.url || "",
          points: data.score || 0,
          author: data.by || "unknown",
          time: data.time || Math.floor(Date.now() / 1000),
          commentCount: data.descendants || 0,
          text: data.text || "",
        })
        setLoadingArticle(false)
      })
      .catch(() => setLoadingArticle(false))
  }, [id])

  useEffect(() => {
    if (!article?.url || article?.text) return
    fetch(`/api/news/content?url=${encodeURIComponent(article.url)}`)
      .then((r) => r.json())
      .then((data) => {
        setLoadingContent(true)
        setContentError(false)
        if (data?.success && data?.data?.content) {
          setContent(data.data)
        } else {
          setContentError(true)
        }
        setLoadingContent(false)
      })
      .catch(() => {
        setContentError(true)
        setLoadingContent(false)
      })
  }, [article?.url, article?.text])

  useEffect(() => {
    if (contentRef.current && content) {
      const images = contentRef.current.querySelectorAll("img")
      images.forEach((img) => {
        if (!img.dataset.loaded) {
          img.dataset.loaded = "true"
        }
      })
    }
  }, [content])

  if (loadingArticle) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-5 w-24 mb-6" />
          <Card>
            <CardContent className="p-6 sm:p-8 space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center py-20">
          <Newspaper className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-lg text-muted-foreground">Article not found</p>
          <Link href="/news" className="text-primary hover:underline mt-2 inline-block">
            Back to news
          </Link>
        </div>
      </div>
    )
  }

  const timeDisplay = article?.time
    ? new Date(article.time * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : ""

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to News
        </Link>

        <article>
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight mb-4">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                {article.points} points
              </span>
              <span>
                by <strong className="text-foreground">{article.author}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {timeDisplay}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {article.commentCount} comments
              </span>
              {content?.siteName && (
                <Badge variant="secondary" className="text-[10px]">
                  {content.siteName}
                </Badge>
              )}
            </div>
          </header>

          {/* HN text post */}
          {article.text && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div
                  className="prose prose-sm dark:prose-invert max-w-none leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: article.text }}
                />
              </CardContent>
            </Card>
          )}

          {/* Full article content */}
          {loadingContent && (
            <Card>
              <CardContent className="p-6 sm:p-8 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </CardContent>
            </Card>
          )}

          {contentError && !article.text && (
            <Card className="mb-8">
              <CardContent className="p-12 text-center">
                <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground mb-1">
                  Could not load full article content
                </p>
                <p className="text-xs text-muted-foreground/60 mb-4">
                  This article may require JavaScript or have restrictions
                </p>
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    Open original <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          )}

          {content && content.content && (
            <Card className="mb-8 overflow-hidden">
              <CardContent className="p-0">
                {content.byline && (
                  <div className="px-6 sm:px-8 pt-6 pb-2 text-sm text-muted-foreground border-b">
                    By <span className="font-medium text-foreground">{content.byline}</span>
                    {content.siteName && <> · {content.siteName}</>}
                  </div>
                )}
                <div
                  ref={contentRef}
                  className="article-content px-6 sm:px-8 py-6"
                  dangerouslySetInnerHTML={{ __html: content.content }}
                />
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2 pb-8">
            {article.url && (
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                <Button>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Read Original
                </Button>
              </a>
            )}
            <a
              href={`https://news.ycombinator.com/item?id=${id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline">
                <MessageCircle className="mr-2 h-4 w-4" />
                Discuss on HN
              </Button>
            </a>
          </div>
        </article>
      </div>
    </div>
  )
}

import { NextRequest } from "next/server"
import { JSDOM } from "jsdom"
import { Readability } from "@mozilla/readability"
import { apiSuccess, apiError } from "@/lib/api-utils"

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")
  if (!url) return apiError("Missing url parameter")

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) return apiError("Failed to fetch article")

    const html = await res.text()
    const dom = new JSDOM(html, { url })
    const document = dom.window.document

    const reader = new Readability(document)
    const article = reader.parse()

    if (!article || !article.textContent || article.textContent.trim().length < 100) {
      return apiError("Could not extract article content")
    }

    const paragraphs = article.textContent
      .split(/\n\s*\n/)
      .map((p: string) => p.replace(/\s+/g, " ").trim())
      .filter((p: string) => p.length > 30)

    return apiSuccess({
      title: article.title || "",
      excerpt: article.excerpt || "",
      content: article.content || "",
      paragraphs: paragraphs.slice(0, 120),
      textContent: article.textContent,
      url,
      byline: article.byline || "",
      siteName: article.siteName || "",
    })
  } catch (e) {
    return apiError(
      e instanceof Error ? e.message : "Could not fetch article content"
    )
  }
}

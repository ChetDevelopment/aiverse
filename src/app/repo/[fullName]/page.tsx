import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { githubFetcher, decodeReadme, computeLanguagePercentages } from "@/lib/discovery/github-fetch"
import { RepoDetailClient } from "./client"

interface Props { params: Promise<{ fullName: string }> }

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { fullName } = await params
  const repo = await githubFetcher.getRepo(decodeURIComponent(fullName))
  if (!repo) return { title: "Repository Not Found" }
  return {
    title: `${repo.name} — AIVerse`,
    description: repo.description || `${repo.name} on AIVerse`,
    alternates: { canonical: `${process.env.NEXT_PUBLIC_APP_URL}/repo/${fullName}` },
  }
}

export default async function RepoPage({ params }: Props) {
  const { fullName } = await params
  const name = decodeURIComponent(fullName)

  const [repo, readme, languages, contributors, releases] = await Promise.all([
    githubFetcher.getRepo(name),
    githubFetcher.getReadme(name),
    githubFetcher.getLanguages(name),
    githubFetcher.getContributors(name),
    githubFetcher.getReleases(name),
  ])

  if (!repo) notFound()

  const decodedReadme = decodeReadme(readme)

  // Generate AI summary if OpenAI key is available
  let aiSummary = ""
  const apiKey = process.env.OPENAI_API_KEY
  if (apiKey && decodedReadme) {
    try {
      const summaryRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Summarize this open-source project in 2-3 sentences. Focus on what it does, its key features, and who it's for." },
            { role: "user", content: decodedReadme.slice(0, 3000) },
          ],
          max_tokens: 150,
        }),
      })
      const summaryData = await summaryRes.json()
      aiSummary = summaryData.choices?.[0]?.message?.content || ""
    } catch (error) {
      console.error("[REPO] OpenAI summary failed", error)
    }
  }

  return (
    <RepoDetailClient
      repo={repo}
      readme={decodedReadme}
      aiSummary={aiSummary}
      languages={computeLanguagePercentages(languages)}
      contributors={contributors || []}
      releases={releases || []}
    />
  )
}

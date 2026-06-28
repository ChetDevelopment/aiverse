import { NextRequest } from "next/server"
import { apiSuccess, apiError } from "@/lib/api-utils"
import {
  githubFetcher,
  decodeReadme,
  computeLanguagePercentages,
} from "@/lib/discovery/github-fetch"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fullName = searchParams.get("full_name")
  if (!fullName) return apiError("full_name is required")

  const [repo, readme, languages, contributors, releases] = await Promise.all([
    githubFetcher.getRepo(fullName),
    githubFetcher.getReadme(fullName),
    githubFetcher.getLanguages(fullName),
    githubFetcher.getContributors(fullName),
    githubFetcher.getReleases(fullName),
  ])

  if (!repo) return apiError("Repository not found", 404)

  // Generate AI summary if OpenAI key is available
  let aiSummary = ""
  const apiKey = process.env.OPENAI_API_KEY
  if (apiKey && readme) {
    try {
      const readmeText = decodeReadme(readme)
      const summaryRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Summarize this open-source project in 2-3 sentences. Focus on what it does, its key features, and who it's for. Be concise." },
            { role: "user", content: readmeText.slice(0, 3000) },
          ],
          max_tokens: 150,
        }),
      })
      const summaryData = await summaryRes.json()
      aiSummary = summaryData.choices?.[0]?.message?.content || ""
    } catch (error) {
      console.error("[API_GITHUB_REPO] OpenAI summary", error)
    }
  }

  return apiSuccess({
    repo,
    readme: decodeReadme(readme),
    aiSummary,
    languages: computeLanguagePercentages(languages),
    contributors,
    releases,
  })
}

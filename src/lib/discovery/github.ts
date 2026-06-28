const CATEGORY_QUERIES: Record<string, string[]> = {
  "chat-ai": [
    "chatbot OR conversational-ai OR chatgpt-clone OR llm-chat sort:stars-desc stars:>100",
    "ai-chatbot OR chat-ui OR open-source-chat sort:stars-desc stars:>50",
  ],
  "coding": [
    "code-generator OR code-assistant OR programming-ai sort:stars-desc stars:>100",
    "ai-coding OR code-review OR code-completion sort:stars-desc stars:>50",
  ],
  "image": [
    "stable-diffusion OR image-generation OR text-to-image sort:stars-desc stars:>100",
    "ai-image OR diffusion-model OR image-editing sort:stars-desc stars:>50",
  ],
  "video": [
    "video-generation OR text-to-video OR ai-video sort:stars-desc stars:>50",
    "video-editing-ai OR ai-animation sort:stars-desc stars:>30",
  ],
  "voice": [
    "text-to-speech OR speech-recognition OR voice-cloning sort:stars-desc stars:>100",
    "whisper OR tts OR stt OR voice-ai sort:stars-desc stars:>50",
  ],
  "marketing": [
    "marketing-ai OR seo-tool OR content-generator sort:stars-desc stars:>30",
    "email-automation OR social-media-ai sort:stars-desc stars:>20",
  ],
  "writing": [
    "writing-assistant OR content-writer OR text-generation sort:stars-desc stars:>100",
    "ai-writing OR markdown-editor OR blog-generator sort:stars-desc stars:>50",
  ],
  "productivity": [
    "productivity-tool OR task-manager OR note-taking sort:stars-desc stars:>100",
    "ai-productivity OR pomodoro OR todo-app sort:stars-desc stars:>30",
  ],
  "business": [
    "business-intelligence OR analytics-dashboard OR crm sort:stars-desc stars:>50",
    "ai-business OR reporting-tool OR data-viz sort:stars-desc stars:>30",
  ],
  "education": [
    "education-ai OR learning-platform OR tutoring sort:stars-desc stars:>50",
    "ai-education OR flashcard OR quiz-generator sort:stars-desc stars:>30",
  ],
  "automation": [
    "workflow-automation OR ci-cd OR devops-tool sort:stars-desc stars:>100",
    "automation-framework OR pipeline-orchestrator sort:stars-desc stars:>50",
  ],
  "open-source": [
    "open-source-ai OR machine-learning-framework stars:>500 sort:stars-desc",
    "deep-learning OR neural-network stars:>500 sort:stars-desc",
  ],
  "local-ai": [
    "local-llm OR on-device-ai OR edge-inference sort:stars-desc stars:>100",
    "llama-cpp OR ollama OR gpt4all sort:stars-desc stars:>50",
  ],
  "ai-agents": [
    "ai-agent OR autonomous-agent OR agent-framework sort:stars-desc stars:>100",
    "multi-agent OR agent-orchestration sort:stars-desc stars:>50",
  ],
  "llms": [
    "large-language-model OR transformer OR llm sort:stars-desc stars:>300",
    "language-model OR gpt OR llama OR mistral sort:stars-desc stars:>200",
  ],
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "chat-ai": ["chat", "conversation", "chatbot", "dialog", "chatgpt", "claude", "llm-chat", "chat-ui"],
  "coding": ["code", "programming", "developer", "ide", "compiler", "coding", "github", "vscode"],
  "image": ["image", "diffusion", "stable-diffusion", "photo", "picture", "art", "drawing"],
  "video": ["video", "animation", "movie", "clip", "video-editing", "frame"],
  "voice": ["voice", "speech", "audio", "tts", "stt", "whisper", "vocal"],
  "marketing": ["marketing", "seo", "email", "campaign", "social-media", "analytics"],
  "writing": ["writing", "content", "blog", "article", "copy", "text-generation", "markdown"],
  "productivity": ["productivity", "task", "todo", "note", "calendar", "workflow", "pomodoro"],
  "business": ["business", "crm", "analytics", "dashboard", "report", "finance", "accounting"],
  "education": ["education", "learn", "course", "tutor", "student", "classroom", "flashcard"],
  "automation": ["automation", "pipeline", "ci", "cd", "devops", "workflow", "deploy"],
  "open-source": ["framework", "library", "toolkit", "sdk", "api", "platform"],
  "local-ai": ["local", "llama.cpp", "ollama", "onnx", "edge", "mobile", "device"],
  "ai-agents": ["agent", "autonomous", "tool-use", "function-calling", "multi-agent"],
  "llms": ["llm", "language-model", "transformer", "gpt", "mistral", "llama", "model"],
}

export interface DiscoveredRepo {
  repoName: string; repoOwner: string; fullName: string
  githubUrl: string; description: string; stars: number
  forks: number; watchers: number; language: string | null
  topics: string; license: string | null; category: string
  readmeScore: number; lastPushAt: Date; logoUrl: string | null
}

function classifyRepo(name: string, description: string, topics: string[]): string {
  const text = [name, description, ...topics].join(" ").toLowerCase()
  let bestCat = "open-source"
  let bestScore = 0
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter((kw) => text.includes(kw)).length
    if (score > bestScore) { bestScore = score; bestCat = cat }
  }
  return bestCat
}

export async function searchGitHubRepos(): Promise<{ repos: DiscoveredRepo[]; log: { query: string; found: number }[] }> {
  const token = process.env.GITHUB_TOKEN
  if (!token) throw new Error("GITHUB_TOKEN required")
  const headers = { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json", "User-Agent": "AIVerse/1.0" }
  const allRepos = new Map<string, DiscoveredRepo>()
  const logs: { query: string; found: number }[] = []
  const categories = Object.keys(CATEGORY_QUERIES)

  for (const cat of categories) {
    const queries = CATEGORY_QUERIES[cat]
    for (const query of queries) {
      try {
        const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=15&sort=stars`
        const res = await fetch(url, { headers })
        if (!res.ok) {
          if (res.status === 403) { logs.push({ query, found: -1 }); break }
          logs.push({ query, found: 0 })
          continue
        }
        const data = await res.json()
        const repos = (data.items || []) as Record<string, unknown>[]
        logs.push({ query, found: repos.length })

        for (const repo of repos) {
          if (repo.fork) continue
          if (allRepos.has(repo.full_name as string)) continue
          const topics = (repo.topics as string[]) || []
          const description = (repo.description as string) || ""
          const owner = repo.owner as Record<string, unknown> | null

          allRepos.set(repo.full_name as string, {
            repoName: repo.name as string,
            repoOwner: (owner?.login as string) || "unknown",
            fullName: repo.full_name as string,
            githubUrl: repo.html_url as string,
            description,
            stars: (repo.stargazers_count as number) || 0,
            forks: (repo.forks_count as number) || 0,
            watchers: (repo.watchers_count as number) || 0,
            language: repo.language as string | null,
            topics: topics.join(", "),
            license: (repo.license as Record<string, unknown>)?.spdx_id as string || null,
            category: classifyRepo(repo.name as string, description, topics),
            readmeScore: (repo.description ? (repo.description as string).length > 100 ? 5 : 3 : 1) + (topics.length > 0 ? topics.length : 0),
            lastPushAt: repo.pushed_at ? new Date(repo.pushed_at as string) : new Date(),
            logoUrl: (owner?.avatar_url as string) || null,
          })
        }
      } catch {
        logs.push({ query, found: 0 })
      }
    }
  }

  return { repos: Array.from(allRepos.values()), log: logs }
}

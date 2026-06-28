export interface GitHubRepoFull {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  homepage: string | null
  stars: number
  forks: number
  watchers: number
  open_issues: number
  language: string | null
  topics: string[]
  license: { spdx_id: string; name: string } | null
  owner: { login: string; avatar_url: string }
  default_branch: string
  created_at: string
  updated_at: string
  pushed_at: string
  size: number
  has_wiki: boolean
  has_discussions: boolean
  has_projects: boolean
  archived: boolean
  disabled: boolean
}

export interface GitHubFile {
  name: string
  path: string
  type: "file" | "dir"
  size: number
}

export interface GitHubContributor {
  login: string
  avatar_url: string
  contributions: number
}

export interface GitHubRelease {
  tag_name: string
  name: string | null
  body: string | null
  published_at: string
  prerelease: boolean
  html_url: string
}

export interface GitHubLanguages {
  [language: string]: number
}

export interface GitHubReadme {
  content: string
  encoding: string
}

class GitHubFetcher {
  private token: string
  private headers: Record<string, string>

  constructor() {
    this.token = process.env.GITHUB_TOKEN || ""
    this.headers = {
      Authorization: `token ${this.token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "AIVerse/1.0",
    }
  }

  private async fetch<T>(url: string): Promise<T | null> {
    try {
      const res = await fetch(url, { headers: this.headers })
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  }

  async getRepo(fullName: string): Promise<GitHubRepoFull | null> {
    return this.fetch<GitHubRepoFull>(`https://api.github.com/repos/${fullName}`)
  }

  async getReadme(fullName: string): Promise<GitHubReadme | null> {
    return this.fetch<GitHubReadme>(`https://api.github.com/repos/${fullName}/readme`)
  }

  async getLanguages(fullName: string): Promise<GitHubLanguages | null> {
    return this.fetch<GitHubLanguages>(`https://api.github.com/repos/${fullName}/languages`)
  }

  async getContributors(fullName: string, limit = 10): Promise<GitHubContributor[]> {
    const data = await this.fetch<GitHubContributor[]>(
      `https://api.github.com/repos/${fullName}/contributors?per_page=${limit}`
    )
    return data || []
  }

  async getReleases(fullName: string, limit = 5): Promise<GitHubRelease[]> {
    const data = await this.fetch<GitHubRelease[]>(
      `https://api.github.com/repos/${fullName}/releases?per_page=${limit}`
    )
    return data || []
  }

  async getFileTree(fullName: string, path = "", depth = 1): Promise<GitHubFile[]> {
    if (depth > 2) return []
    const data = await this.fetch<GitHubFile[]>(
      `https://api.github.com/repos/${fullName}/contents/${path}`
    )
    if (!data) return []
    const result: GitHubFile[] = []
    for (const item of data) {
      result.push(item)
      if (item.type === "dir" && depth < 2) {
        const children = await this.getFileTree(fullName, item.path, depth + 1)
        result.push(...children)
      }
    }
    return result
  }

  async getCommitCount(fullName: string): Promise<number> {
    const data = await this.fetch<{ sha: string }[]>(
      `https://api.github.com/repos/${fullName}/commits?per_page=1&page=1`
    )
    if (!data || data.length === 0) return 0
    // Estimate: check last page via Link header
    try {
      const res = await fetch(`https://api.github.com/repos/${fullName}/commits?per_page=1`, {
        headers: this.headers,
      })
      const link = res.headers.get("link") || ""
      const match = link.match(/page=(\d+)>; rel="last"/)
      if (match) return parseInt(match[1])
    } catch {}
    return 0
  }
}

export const githubFetcher = new GitHubFetcher()

export function decodeReadme(readme: GitHubReadme | null): string {
  if (!readme) return ""
  if (readme.encoding === "base64") {
    return Buffer.from(readme.content, "base64").toString("utf-8")
  }
  return readme.content
}

export function computeLanguagePercentages(languages: GitHubLanguages | null): { name: string; percentage: number; color: string }[] {
  if (!languages) return []
  const total = Object.values(languages).reduce((a, b) => a + b, 0)
  if (total === 0) return []

  const colorMap: Record<string, string> = {
    TypeScript: "#3178c6", Python: "#3572A5", JavaScript: "#f7df1e", Rust: "#dea584",
    Go: "#00ADD8", Java: "#b07219", C: "#555555", "C++": "#f34b7d", Ruby: "#701516",
    Shell: "#89e051", HTML: "#e34c26", CSS: "#563d7c", Swift: "#F05138",
    Kotlin: "#A97BFF", Dart: "#00B4AB", Lua: "#000080", Zig: "#ec915c",
    PHP: "#4F5D95", Scala: "#c22d40", Haskell: "#5e5086", Elixir: "#6e4a7e",
    Clojure: "#db5855", Nix: "#7e7eff", Dockerfile: "#384d54", Makefile: "#427819",
    TeX: "#3D6117", R: "#198CE7", Julia: "#a270ba", Svelte: "#ff3e00",
  }

  return Object.entries(languages)
    .map(([name, bytes]) => ({
      name,
      percentage: Math.round((bytes / total) * 1000) / 10,
      color: colorMap[name] || "#8b8b8b",
    }))
    .sort((a, b) => b.percentage - a.percentage)
}

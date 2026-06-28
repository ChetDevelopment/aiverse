const COMMON_FILES: Record<string, string> = {
  "CONTRIBUTING.md": "Contributing Guidelines",
  "CODE_OF_CONDUCT.md": "Code of Conduct",
  "SECURITY.md": "Security Policy",
  "ROADMAP.md": "Roadmap",
  "CHANGELOG.md": "Changelog",
  "GOVERNANCE.md": "Governance Model",
  "ARCHITECTURE.md": "Architecture Overview",
  "MODEL_CARD.md": "Model Card",
  "DATA_CARD.md": "Data Card",
  ".env.example": "Environment Template",
  "docker-compose.yml": "Docker Compose",
  "Dockerfile": "Dockerfile",
  ".gitignore": "Gitignore",
  ".gitmodules": "Submodules",
  "requirements.txt": "Python Dependencies",
  "package.json": "Node Dependencies",
  "Cargo.toml": "Rust Dependencies",
  "go.mod": "Go Dependencies",
  "Makefile": "Build Script",
  "Justfile": "Build Script",
}

export interface RepoFile {
  name: string
  path: string
  type: "file" | "dir"
  size: number
  category: string
  download_url?: string
}

const CATEGORIES: Record<string, string> = {
  "CONTRIBUTING.md": "Community",
  "CODE_OF_CONDUCT.md": "Community",
  "SECURITY.md": "Security",
  "ROADMAP.md": "Planning",
  "GOVERNANCE.md": "Community",
  "ARCHITECTURE.md": "Documentation",
  "MODEL_CARD.md": "AI/ML",
  "DATA_CARD.md": "AI/ML",
  ".env.example": "Configuration",
  "docker-compose.yml": "DevOps",
  "Dockerfile": "DevOps",
  ".gitignore": "Configuration",
  ".gitmodules": "Configuration",
  "requirements.txt": "Dependencies",
  "package.json": "Dependencies",
  "Cargo.toml": "Dependencies",
  "go.mod": "Dependencies",
  "Makefile": "Build",
  "Justfile": "Build",
  ".github/workflows": "CI/CD",
}

export function categorizeFile(path: string): string {
  for (const [key, cat] of Object.entries(CATEGORIES)) {
    if (path.includes(key)) return cat
  }
  if (path.includes("/test") || path.includes("/tests") || path.endsWith(".test.") || path.endsWith(".spec.")) return "Tests"
  if (path.includes("/migrations") || path.endsWith(".sql")) return "Database"
  if (path.includes("/i18n") || path.includes("/locales") || path.includes("/translations")) return "Localization"
  if (path.includes("/models") || path.endsWith(".pth") || path.endsWith(".pt") || path.endsWith(".bin")) return "AI Models"
  if (path.includes("/data") || path.endsWith(".csv") || path.endsWith(".jsonl")) return "Datasets"
  if (path.includes("/notebooks") || path.endsWith(".ipynb")) return "Notebooks"
  if (path.includes("/demos") || path.includes("/examples")) return "Examples"
  if (path.includes("/docker") || path.includes("Dockerfile")) return "DevOps"
  if (path.endsWith(".yml") || path.endsWith(".yaml")) return "Configuration"
  return "Source"
}

export async function checkCommonFiles(
  fullName: string,
  files: { name: string; path: string; type: string; size: number; download_url?: string }[]
): Promise<{ category: string; files: RepoFile[] }[]> {
  const grouped: Record<string, RepoFile[]> = {}

  for (const file of files) {
    const cat = categorizeFile(file.path)
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push({ ...file, category: cat, type: file.type as "file" | "dir" })
  }

  // Check for specific community/security files in root
  const token = process.env.GITHUB_TOKEN
  const headers = { Authorization: `token ${token}`, "User-Agent": "AIVerse/1.0" }

  for (const [filename, label] of Object.entries(COMMON_FILES)) {
    if (files.some((f) => f.path === filename || f.path.endsWith("/" + filename))) continue
    try {
      const res = await fetch(`https://api.github.com/repos/${fullName}/contents/${filename}`, { headers })
      if (res.ok) {
        const data = await res.json()
        const cat = categorizeFile(filename)
        if (!grouped[cat]) grouped[cat] = []
        grouped[cat].push({
          name: data.name || filename,
          path: data.path || filename,
          type: "file" as const,
          size: data.size || 0,
          category: cat,
          download_url: data.download_url,
        })
      }
    } catch {}
  }

  return Object.entries(grouped).map(([category, files]) => ({ category, files }))
}

export function getBadgeUrl(repo: { fullName: string; type: string }): { label: string; url: string }[] {
  const badges = [
    { label: "GitHub Stars", url: `https://img.shields.io/github/stars/${repo.fullName}?style=flat-square` },
    { label: "License", url: `https://img.shields.io/github/license/${repo.fullName}?style=flat-square` },
    { label: "Last Commit", url: `https://img.shields.io/github/last-commit/${repo.fullName}?style=flat-square` },
    { label: "Open Issues", url: `https://img.shields.io/github/issues/${repo.fullName}?style=flat-square` },
    { label: "PRs", url: `https://img.shields.io/github/issues-pr/${repo.fullName}?style=flat-square` },
  ]
  return badges
}

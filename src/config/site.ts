export const siteConfig = {
  name: "AIVerse",
  description:
    "The AI Productivity Ecosystem — Discover, Learn, Build, and Master AI tools. Your unified workspace for exploring prompts, building stacks, and automating workflows.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://aiverse.ai",
  ogImage: "/images/og.svg",
  links: {
    twitter: "https://twitter.com/aiverse",
    github: "https://github.com/aiverse",
  },
  creator: "AIVerse Team",
  keywords: [
    "AI tools",
    "artificial intelligence",
    "AI directory",
    "machine learning",
    "chat AI",
    "AI coding",
    "AI image generation",
    "AI video",
    "AI writing",
    "AI productivity",
    "best AI tools",
    "free AI tools",
    "AI comparison",
  ],
}

export type SiteConfig = typeof siteConfig

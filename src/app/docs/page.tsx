import type { Metadata } from "next"
import Link from "next/link"
import { Sparkles, BookOpen, Star, ShieldCheck, TrendingUp, Globe, ExternalLink, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Documentation",
  description: "Learn how to use AIVerse — the world's most comprehensive AI tools discovery platform.",
}

const sections = [
  {
    title: "Getting Started",
    icon: Sparkles,
    items: [
      { label: "What is AIVerse?", content: "AIVerse is a comprehensive AI tools directory and open-source project discovery platform. We help you find, compare, and learn about AI tools, LLMs, frameworks, and open-source projects." },
      { label: "How to Search", content: "Use the search bar at the top of any page or visit /search. You can filter by category, pricing, and sort by popularity. If we don't have a tool in our database, we automatically fetch results from GitHub." },
      { label: "Browse Categories", content: "Visit /categories to browse AI tools by category. Each category shows the number of available tools. Click any category to see all tools in that category." },
    ],
  },
  {
    title: "Features",
    icon: Star,
    items: [
      { label: "AI Tool Directory", content: "Browse 600+ AI tools across 15 categories including Chat AI, Coding, Image, Video, Voice, Marketing, Writing, and more. Each tool has detailed information, pricing, and reviews." },
      { label: "Auto Discovery", content: "Our system continuously searches GitHub for new open-source AI projects. Visit /discover to see 350+ auto-discovered projects. Run discovery from the admin panel to refresh." },
      { label: "GitHub Repo Viewer", content: "Every open-source project gets a rich detail page at /repo/[owner]/[name] with README, file tree, issues, PRs, commits, contributors, releases, security alerts, milestones, and code search." },
      { label: "Live Tech News", content: "Stay updated with the latest tech and AI news from Hacker News on the homepage. Auto-refreshes every 15 minutes with topic filters for AI, Dev, Hardware, and Security." },
      { label: "Trending Projects", content: "See what's trending on GitHub across 15 categories including AI/ML, Computer Vision, DevOps, Security, Web Dev, and more at /trending." },
      { label: "Compare Tools", content: "Compare up to 3 AI tools side-by-side. Select tools from search results and click 'Compare' to see pricing, features, ratings, and reviews in one view." },
      { label: "AI Recommendations", content: "Not sure which tool to use? Take our recommendation quiz at /recommend. Answer a few questions and we'll suggest the best tools for your needs." },
    ],
  },
  {
    title: "For Users",
    icon: Users,
    items: [
      { label: "Create an Account", content: "Register at /register to save favorites, bookmark tools, and leave reviews. Your first account becomes an admin automatically." },
      { label: "Favorites & Bookmarks", content: "Save tools you love as favorites. Bookmark tools to read later. Access all your saved items from your profile page." },
      { label: "Leave Reviews", content: "Help the community by leaving reviews on tools you've used. Rate them 1-5 stars and share your experience." },
      { label: "Free AI Deals", content: "Check /deals for curated free AI tool deals, open-source projects, and promotional codes. Updated regularly by our team." },
    ],
  },
  {
    title: "For Developers",
    icon: Globe,
    items: [
      { label: "GitHub Integration", content: "Every open-source project links to its GitHub repository. View README, stars, forks, issues, PRs, commits, contributors, releases, and security alerts." },
      { label: "Auto Discovery", content: "Submit your open-source AI project for discovery. Projects are auto-categorized and reviewed before being listed." },
      { label: "API Access", content: "Search tools programmatically via our API endpoints. Contact us for API key access." },
    ],
  },
  {
    title: "Admin Guide",
    icon: ShieldCheck,
    items: [
      { label: "Dashboard", content: "The admin dashboard at /admin shows key metrics: total tools, categories, users, and reviews." },
      { label: "Manage Tools", content: "Add, edit, and manage AI tools from the admin panel. Set pricing, categories, tags, pros/cons, screenshots, and FAQs." },
      { label: "Discovery Queue", content: "Review auto-discovered projects in the Discovery admin page. Approve or reject projects. Approved projects appear on /discover." },
      { label: "Blog & Content", content: "Create and manage blog posts from the admin panel. Write in markdown with full metadata support." },
      { label: "Free Deals", content: "Add and manage free AI tool deals. Each deal can include promo codes, links, and verification status." },
    ],
  },
  {
    title: "FAQ",
    icon: BookOpen,
    items: [
      { label: "Is AIVerse free?", content: "Yes! AIVerse is completely free to use. Browse tools, read reviews, and discover projects without any cost." },
      { label: "How are tools added?", content: "Tools are added through our admin panel and auto-discovery system. We manually curate and verify each tool before listing." },
      { label: "Can I contribute?", content: "Absolutely! You can leave reviews, suggest tools, and report issues. Contact us through the /contact page." },
      { label: "How often is data updated?", content: "GitHub data is refreshed daily through our auto-discovery system. News updates every 15 minutes. Tool information is updated on request." },
    ],
  },
]

export default function DocsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
        </div>
        <p className="text-muted-foreground mb-10 max-w-2xl">
          Everything you need to know about AIVerse — the world&apos;s most comprehensive AI tools discovery platform.
        </p>

        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-2 mb-4">
                <section.icon className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">{section.title}</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {section.items.map((item) => (
                  <Card key={item.label} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-1">{item.label}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-xl border bg-secondary/50 text-center">
          <p className="text-sm text-muted-foreground">
            Need more help?{" "}
            <Link href="/contact" className="text-primary hover:underline">Contact us</Link>
            {" "}or{" "}
            <Link href="/about" className="text-primary hover:underline">learn more about AIVerse</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

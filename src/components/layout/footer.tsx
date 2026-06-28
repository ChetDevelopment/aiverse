import * as React from "react"
import Link from "next/link"
import { Sparkles } from "lucide-react"

const footerLinks = {
  "AI Tools": [
    { title: "Categories", href: "/categories" },
    { title: "Recommend", href: "/recommend" },
    { title: "Compare", href: "/compare" },
    { title: "Free Tools", href: "/search?pricing=FREE" },
  ],
  Resources: [
    { title: "AI Guides", href: "/recommend" },
    { title: "Trending Tools", href: "/search?sort=popular" },
    { title: "New Tools", href: "/search?sort=newest" },
    { title: "Sitemap", href: "/sitemap.xml" },
  ],
  Company: [
    { title: "About", href: "/about" },
    { title: "Privacy", href: "/privacy" },
    { title: "Terms", href: "/terms" },
    { title: "Contact", href: "/contact" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-bold tracking-tight"
            >
              <Sparkles className="h-5 w-5 text-primary" />
              AIVerse
            </Link>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              Discover, compare, and learn about the best AI tools. Find the
              perfect AI for any task.
            </p>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold mb-3">{category}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} AIVerse. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="/privacy"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

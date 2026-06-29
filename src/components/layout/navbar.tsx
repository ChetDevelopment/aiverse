"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, X, Search, Sparkles, ChevronDown, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { NotificationBell } from "@/components/notifications/bell"
import { useUser } from "@/hooks/use-user"
import { cn } from "@/lib/utils"

interface NavLink {
  title: string
  href: string
}

interface NavSection {
  label: string
  links: NavLink[]
}

const navSections: NavSection[] = [
  {
    label: "DISCOVER",
    links: [
      { title: "AI Tools", href: "/search" },
      { title: "Categories", href: "/categories" },
      { title: "Trending", href: "/trending" },
      { title: "Discover", href: "/discover" },
    ],
  },
  {
    label: "LEARN",
    links: [
      { title: "Learning Center", href: "/learn" },
      { title: "Prompt Library", href: "/prompts" },
      { title: "Use Cases", href: "/usecases" },
      { title: "Blog", href: "/blog" },
      { title: "AI News", href: "/news" },
    ],
  },
  {
    label: "BUILD",
    links: [
      { title: "Workspaces", href: "/workspaces" },
      { title: "AI Stacks", href: "/stacks" },
      { title: "Collections", href: "/saved" },
      { title: "Compare", href: "/compare" },
    ],
  },
  {
    label: "INTELLIGENCE",
    links: [
      { title: "Trading Hub", href: "/trading" },
      { title: "Free Deals", href: "/deals" },
      { title: "Docs", href: "/docs" },
    ],
  },
]

export function Navbar() {
  const { user, loading } = useUser()
  const [isOpen, setIsOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const [openSection, setOpenSection] = React.useState<string | null>(null)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleCloseMobile = React.useCallback(() => {
    setIsOpen(false)
    setOpenSection(null)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight shrink-0"
        >
          <Sparkles className="h-6 w-6 text-primary" />
          AIVerse
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {navSections.map((section) => (
            <div
              key={section.label}
              className="relative group"
              onMouseEnter={() => setOpenSection(section.label)}
              onMouseLeave={() => setOpenSection(null)}
            >
              <button
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
                aria-expanded={openSection === section.label}
                aria-haspopup="true"
              >
                {section.label}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    openSection === section.label && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "absolute top-full left-0 mt-1 w-52 rounded-xl border bg-background/95 backdrop-blur-lg p-2 shadow-xl shadow-black/5 transition-all duration-200",
                  openSection === section.label
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible -translate-y-1 pointer-events-none"
                )}
                role="menu"
              >
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
                    role="menuitem"
                    onClick={() => setOpenSection(null)}
                  >
                    {link.title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/search">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          </Link>
          <NotificationBell />
          <ModeToggle />
          {loading ? null : user ? (
            <Link href={user.role === "ADMIN" ? "/admin" : "/profile"}>
              <Button variant="ghost" size="sm" className="gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[100px] truncate">{user.name || user.email}</span>
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="hidden sm:inline-flex">Get Started</Button>
              </Link>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
            onClick={() => { const next = !isOpen; setIsOpen(next); if (!next) setOpenSection(null) }}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div id="mobile-menu" className="md:hidden border-b bg-background px-4 pb-4">
          <nav className="flex flex-col gap-1 pt-2">
            {navSections.map((section) => (
              <div key={section.label} className="border-b border-border/50 last:border-0">
                <button
                  onClick={() =>
                    setOpenSection(openSection === section.label ? null : section.label)
                  }
                  className="flex w-full items-center justify-between px-3 py-3 text-sm font-medium text-foreground"
                  aria-expanded={openSection === section.label}
                >
                  {section.label}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform duration-200",
                      openSection === section.label && "rotate-180"
                    )}
                  />
                </button>
                {openSection === section.label && (
                  <div className="pb-2 pl-3 space-y-0.5">
                    {section.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
                        onClick={handleCloseMobile}
                      >
                        {link.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <hr className="my-2" />
            {user ? (
              <Link
                href={user.role === "ADMIN" ? "/admin" : "/profile"}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium"
                onClick={() => setIsOpen(false)}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </span>
                {user.name || user.email}
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-3 py-2.5 text-sm font-medium" onClick={() => setIsOpen(false)}>Log in</Link>
                <Link href="/register" className="px-3 py-2.5 text-sm font-medium" onClick={() => setIsOpen(false)}>Get Started</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sparkles, Search, BookOpen, Briefcase, TrendingUp, User } from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Home", icon: Sparkles },
  { href: "/search", label: "Search", icon: Search },
  { href: "/trending", label: "Trending", icon: TrendingUp },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/workspaces", label: "Workspaces", icon: Briefcase },
  { href: "/profile", label: "Profile", icon: User },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  if (pathname.startsWith("/admin")) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden safe-area-bottom" aria-label="Mobile navigation">
      <div className="flex items-center justify-around h-14">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-[3.5rem] py-1 px-2 rounded-lg transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <link.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

import Link from "next/link"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { LayoutDashboard, Grid3X3, Users, Star, Mail, BarChart3, Settings, PlusCircle, List, Tags, MessageSquare, Newspaper, Download, LogOut } from "lucide-react"

const SESSION_COOKIES = ["aiverse_local_session", "aiverse_google_session", "aiverse_github_session"]

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/tools/new", label: "Add Tool", icon: PlusCircle },
  { href: "/admin/tools", label: "All Tools", icon: List },
  { href: "/admin/categories", label: "Categories", icon: Grid3X3 },
  { href: "/admin/tags", label: "Tags", icon: Tags },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/contact", label: "Messages", icon: MessageSquare },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/discover", label: "Discovery", icon: Tags },
  { href: "/admin/ingestion", label: "Auto Ingestion", icon: Download },
  { href: "/admin/deals", label: "Free Deals", icon: Tags },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Try Supabase auth
  let userId: string | null = null
  let userRole: string | null = null

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      userId = user.id
      const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } })
      userRole = dbUser?.role || null
    }
  } catch (error) {
    console.error("[ADMIN_LAYOUT] Supabase auth", error)
  }

  // Fallback: check custom session cookies
  if (!userId) {
    try {
      const cookieStore = await cookies()
      for (const name of SESSION_COOKIES) {
        const session = cookieStore.get(name)
        if (session?.value) {
          const data = JSON.parse(Buffer.from(session.value, "base64").toString())
          userId = data.id
          userRole = data.role
          break
        }
      }
    } catch (error) {
      console.error("[ADMIN_LAYOUT] Auth cookie", error)
    }
  }

  if (!userId) {
    redirect("/login?redirect=/admin")
  }

  if (userRole !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden lg:flex w-64 flex-col border-r bg-background fixed left-0 top-0 bottom-0 z-30 pt-16">
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          <hr className="my-2 border-border/50" />
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}

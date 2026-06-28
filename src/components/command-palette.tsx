"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, Sparkles, Grid3X3, FileText, ArrowRight, Command } from "lucide-react"

interface Action {
  id: string
  label: string
  description: string
  href: string
  icon: typeof Search
  category: string
}

const actions: Action[] = [
  { id: "home", label: "Home", description: "Go to homepage", href: "/", icon: Sparkles, category: "Pages" },
  { id: "categories", label: "Categories", description: "Browse AI tool categories", href: "/categories", icon: Grid3X3, category: "Pages" },
  { id: "blog", label: "Blog", description: "Read AI guides and articles", href: "/blog", icon: FileText, category: "Pages" },
  { id: "recommend", label: "Recommendations", description: "Get AI tool recommendations", href: "/recommend", icon: Sparkles, category: "Tools" },
  { id: "compare", label: "Compare", description: "Compare AI tools side by side", href: "/compare", icon: ArrowRight, category: "Tools" },
  { id: "search", label: "Search Tools", description: "Search the AI tools directory", href: "/search", icon: Search, category: "Tools" },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  function close() {
    setOpen(false)
    setQuery("")
  }

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const filtered = actions.filter(
    (a) =>
      a.label.toLowerCase().includes(query.toLowerCase()) ||
      a.description.toLowerCase().includes(query.toLowerCase())
  )

  const       execute = useCallback(
    (action: Action) => {
      close()
      router.push(action.href)
    },
    [router]
  )

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % filtered.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length)
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      execute(filtered[selectedIndex])
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-lg rounded-2xl border bg-background shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 border-b px-4">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0) }}
            onKeyDown={handleKeyDown}
            placeholder="Search pages and tools..."
            className="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border bg-secondary px-2 text-[11px] text-muted-foreground">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No results found</p>
          ) : (
            filtered.map((action, i) => (
              <button
                key={action.id}
                onClick={() => execute(action)}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  i === selectedIndex ? "bg-accent text-accent-foreground" : ""
                }`}
              >
                <action.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                </div>
                <span className="shrink-0 text-[10px] text-muted-foreground">{action.category}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

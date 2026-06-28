"use client"

import * as React from "react"
import Link from "next/link"
import { Search, Plus, Heart, MessageCircle, Layers, Copy, ArrowRight, Sparkles, Briefcase, Wrench, RefreshCw, FolderKanban } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { useDebounce } from "@/hooks/use-debounce"
import { useUser } from "@/hooks/use-user"

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "writing", label: "Writing" },
  { value: "coding", label: "Coding" },
  { value: "design", label: "Design" },
  { value: "marketing", label: "Marketing" },
  { value: "research", label: "Research" },
  { value: "productivity", label: "Productivity" },
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
]

export default function StacksPage() {
  const { user } = useUser()
  const [query, setQuery] = React.useState("")
  const [category, setCategory] = React.useState("")
  const [tab, setTab] = React.useState<"explore" | "mine">("explore")
  const [stacks, setStacks] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showCreate, setShowCreate] = React.useState(false)
  const [createName, setCreateName] = React.useState("")
  const [createDesc, setCreateDesc] = React.useState("")
  const [createEmoji, setCreateEmoji] = React.useState("🔧")
  const debouncedQuery = useDebounce(query, 250)

  const fetchStacks = React.useCallback(async (q?: string, t?: string, u?: string | null) => {
    try {
      const params = new URLSearchParams()
      if (q) params.set("q", q)
      if (t === "mine" && u) { params.set("mine", "true"); params.set("userId", u) }
      const res = await fetch(`/api/stacks?${params.toString()}`)
      const data = await res.json()
      setStacks(data.data)
      setLoading(false)
    } catch {
      setStacks([])
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    Promise.resolve().then(() => fetchStacks(debouncedQuery, tab, user?.id))
  }, [debouncedQuery, tab, user?.id, fetchStacks])

  async function handleCreate() {
    if (!createName.trim()) return
    try {
      const res = await fetch("/api/stacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName,
          description: createDesc,
          emoji: createEmoji,
        }),
      })
      if (res.ok) {
        setShowCreate(false)
        setCreateName("")
        setCreateDesc("")
        setTab("mine")
        fetchStacks("", "mine", user?.id)
      }
    } catch (error) {
      console.error("[STACKS_PAGE] Failed to create stack", error)
    }
  }

  const filteredStacks = category
    ? stacks.filter((s) => {
        const desc = (s.description || "").toLowerCase()
        return desc.includes(category)
      })
    : stacks

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border mb-12">
          <div className="relative z-10 px-8 py-12 sm:px-12 sm:py-16 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-6">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              AI Stack Builder
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Combine the best AI tools into powerful stacks. Build workflows, share with the community, and supercharge your productivity.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button size="lg" onClick={() => setShowCreate(true)} disabled={!user}>
                <Plus className="mr-2 h-5 w-5" />
                Create Your Stack
              </Button>
              <Link href="/stacks">
                <Button variant="outline" size="lg">
                  Explore Stacks
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            {!user && (
              <p className="text-sm text-muted-foreground mt-3">
                Sign in to create and save your own stacks
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1 rounded-lg border p-1">
            <button
              onClick={() => setTab("explore")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === "explore" ? "bg-primary text-primary-foreground" : "hover:text-foreground"
              }`}
            >
              Explore
            </button>
            {user && (
              <button
                onClick={() => setTab("mine")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  tab === "mine" ? "bg-primary text-primary-foreground" : "hover:text-foreground"
                }`}
              >
                Your Stacks
              </button>
            )}
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)} disabled={!user}>
            <Plus className="mr-2 h-4 w-4" />
            New Stack
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stacks..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 pl-10 rounded-lg text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Badge
                key={cat.value}
                variant={category === cat.value ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setCategory(category === cat.value ? "" : cat.value)}
              >
                {cat.label}
              </Badge>
            ))}
          </div>
        </div>

        {showCreate && (
          <Card className="mb-8">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">Create New Stack</h3>
              <div className="flex gap-3">
                <Input
                  placeholder="Emoji (e.g. 🔧)"
                  value={createEmoji}
                  onChange={(e) => setCreateEmoji(e.target.value)}
                  className="w-20 text-center text-lg"
                />
                <div className="flex-1 space-y-3">
                  <Input
                    placeholder="Stack name"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={createDesc}
                    onChange={(e) => setCreateDesc(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button size="sm" onClick={handleCreate} disabled={!createName.trim()}>Create</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-3">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredStacks.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStacks.map((stack) => (
              <Link key={stack.id} href={`/stacks/${stack.id}`}>
                <Card className="h-full hover:shadow-md transition-all duration-200 group">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start gap-3 mb-3">
                      {stack.emoji ? (
                        <span className="text-2xl group-hover:scale-110 transition-transform">
                          {stack.emoji}
                        </span>
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary group-hover:scale-110 transition-transform">
                          <Wrench className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{stack.name}</h3>
                        {stack.user?.name && (
                          <p className="text-xs text-muted-foreground truncate">
                            by {stack.user.name}
                          </p>
                        )}
                      </div>
                    </div>
                    {stack.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
                        {stack.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" />
                        {stack._count.items} tools
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" />
                        {stack.likeCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Copy className="h-3.5 w-3.5" />
                        {stack.cloneCount}
                      </span>
                      <span className="flex items-center gap-1 ml-auto">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {stack._count.comments}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : tab === "mine" ? (
          <EmptyState
            icon={FolderKanban}
            title="Your stacks are empty"
            description="Stacks are collections of AI tools that work great together. Combine your favorites into powerful workflows."
            action={<Button onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" />Create Your First Stack</Button>}
          />
        ) : (
          <EmptyState
            icon={Search}
            title="No stacks found"
            description="No stacks match your search. Try different keywords or browse all categories."
            action={<Button variant="outline" onClick={() => { setQuery(""); setCategory("") }}><RefreshCw className="mr-2 h-4 w-4" />Clear Filters</Button>}
          />
        )}
      </div>
    </div>
  )
}

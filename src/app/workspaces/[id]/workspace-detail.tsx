"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft, Plus, Pencil, Trash2, Globe, Lock, GripVertical,
  ExternalLink, FileText, StickyNote, Workflow, Wrench, Lightbulb, BookOpen, Search,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ToolCard } from "@/components/home/tool-card"
import { EmptyState } from "@/components/shared/empty-state"
import { useToast } from "@/components/toast"
import * as Tabs from "@radix-ui/react-tabs"
import * as Dialog from "@radix-ui/react-dialog"
import * as Switch from "@radix-ui/react-switch"
import { cn, formatDate } from "@/lib/utils"
import type { ToolCardData } from "@/types"

interface Prompt {
  id: string
  title: string
  content: string
  description: string | null
  category: string | null
  difficulty: string
  toolId: string
  tool: { id: string; name: string; slug: string; logo: string | null }
}

interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
}

interface WorkspaceItem {
  id: string
  workspaceId: string
  toolId: string | null
  note: string | null
  promptId: string | null
  collectionId: string | null
  workflow: string | null
  order: number
  tool: ToolCardData | null
  prompt: Prompt | null
  collection: Collection | null
}

interface Workspace {
  id: string
  name: string
  description: string | null
  emoji: string
  isPublic: boolean
  archived: boolean
  createdAt: string
  updatedAt: string
  items: WorkspaceItem[]
  _count: { items: number }
}

interface AiTool {
  id: string
  name: string
  slug: string
  tagline: string
  logo: string | null
  pricing: string
  isOpenSource: boolean
  viewCount: number
  categories: { category: { name: string; slug: string } }[]
  reviews: { rating: number }[]
}

export default function WorkspaceDetailPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const { showToast } = useToast()

  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState("tools")
  const [editOpen, setEditOpen] = useState(false)
  const [addToolDialogOpen, setAddToolDialogOpen] = useState(false)
  const [toolSearch, setToolSearch] = useState("")
  const [searchResults, setSearchResults] = useState<AiTool[]>([])
  const [searching, setSearching] = useState(false)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteValue, setNoteValue] = useState("")
  const [savingNote, setSavingNote] = useState(false)
  const [addNoteOpen, setAddNoteOpen] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [addingNote, setAddingNote] = useState(false)

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const res = await fetch(`/api/workspaces/${id}`)
        if (res.ok) {
          const data = await res.json()
          setWorkspace(data)
        } else {
          showToast("Workspace not found", "error")
          router.push("/workspaces")
        }
      } catch {
        showToast("Failed to load workspace", "error")
      }
      setLoading(false)
    }
    fetchWorkspace()
  }, [id, router, showToast])

  useEffect(() => {
    if (!toolSearch.trim() || !addToolDialogOpen) return

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/tools?q=${encodeURIComponent(toolSearch)}&limit=10`)
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data.items || [])
        }
      } catch (error) {
        console.error("[WORKSPACE_DETAIL] Tool search failed", error)
      }
      setSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [toolSearch, addToolDialogOpen])

  async function handleUpdate(data: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/workspaces/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const updated = await res.json()
        setWorkspace((prev) => prev ? { ...prev, ...updated } : null)
        showToast("Workspace updated", "success")
        setEditOpen(false)
      } else {
        const err = await res.json()
        showToast(err.error || "Failed to update", "error")
      }
    } catch {
      showToast("Failed to update workspace", "error")
    }
  }

  async function handleAddTool(toolId: string) {
    try {
      const res = await fetch(`/api/workspaces/${id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId }),
      })
      if (res.ok) {
        const item = await res.json()
        setWorkspace((prev) => prev ? { ...prev, items: [...prev.items, item] } : null)
        showToast("Tool added to workspace", "success")
        setAddToolDialogOpen(false)
        setToolSearch("")
      } else {
        const err = await res.json()
        showToast(err.error || "Failed to add tool", "error")
      }
    } catch {
      showToast("Failed to add tool", "error")
    }
  }

  async function handleAddNote() {
    if (!noteText.trim()) return
    setAddingNote(true)
    try {
      const res = await fetch(`/api/workspaces/${id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteText.trim() }),
      })
      if (res.ok) {
        const item = await res.json()
        setWorkspace((prev) => prev ? { ...prev, items: [...prev.items, item] } : null)
        setNoteText("")
        setAddNoteOpen(false)
        showToast("Note added", "success")
      }
    } catch {
      showToast("Failed to add note", "error")
    }
    setAddingNote(false)
  }

  async function handleUpdateNote(itemId: string) {
    setSavingNote(true)
    try {
      const res = await fetch(`/api/workspaces/${id}/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteValue }),
      })
      if (res.ok) {
        const updated = await res.json()
        setWorkspace((prev) => prev ? {
          ...prev,
          items: prev.items.map((i) => i.id === itemId ? updated : i),
        } : null)
        setEditingNote(null)
        showToast("Note updated", "success")
      }
    } catch {
      showToast("Failed to update note", "error")
    }
    setSavingNote(false)
  }

  async function handleDeleteItem(itemId: string) {
    try {
      const res = await fetch(`/api/workspaces/${id}/items/${itemId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setWorkspace((prev) => prev ? {
          ...prev,
          items: prev.items.filter((i) => i.id !== itemId),
          _count: { items: prev.items.length - 1 },
        } : null)
        showToast("Item removed", "success")
      }
    } catch {
      showToast("Failed to remove item", "error")
    }
  }

  const filteredItems = workspace?.items.filter((item) => {
    if (!search) return true
    const q = search.toLowerCase()
    if (item.tool?.name.toLowerCase().includes(q)) return true
    if (item.tool?.tagline.toLowerCase().includes(q)) return true
    if (item.note?.toLowerCase().includes(q)) return true
    if (item.prompt?.title.toLowerCase().includes(q)) return true
    if (item.prompt?.content.toLowerCase().includes(q)) return true
    if (item.collection?.name.toLowerCase().includes(q)) return true
    if (item.workflow?.toLowerCase().includes(q)) return true
    return false
  })

  const toolItems = filteredItems?.filter((i) => i.tool && !i.note && !i.prompt && !i.collection && !i.workflow) || []
  const noteItems = filteredItems?.filter((i) => i.note) || []
  const promptItems = filteredItems?.filter((i) => i.prompt) || []
  const workflowItems = filteredItems?.filter((i) => i.workflow !== null && i.workflow !== undefined) || []

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-96" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <EmptyState
            icon={Search}
            title="Workspace not found"
            description="This workspace doesn't exist or has been deleted."
            action={<Link href="/workspaces"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Back to workspaces</Button></Link>}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/workspaces"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to workspaces
        </Link>

        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border bg-secondary text-2xl shrink-0">
              {workspace.emoji}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{workspace.name}</h1>
                <Badge variant={workspace.isPublic ? "secondary" : "outline"} className="gap-1">
                  {workspace.isPublic ? <><Globe className="h-3 w-3" /> Public</> : <><Lock className="h-3 w-3" /> Private</>}
                </Badge>
                {workspace.archived && (
                  <Badge variant="secondary">Archived</Badge>
                )}
              </div>
              {workspace.description && (
                <p className="mt-1 text-muted-foreground">{workspace.description}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {workspace._count.items} items &middot; Updated {formatDate(workspace.updatedAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog.Root open={editOpen} onOpenChange={setEditOpen}>
              <Dialog.Trigger asChild>
                <Button variant="outline" size="sm">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
                <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-xl border bg-background p-6 shadow-lg z-50">
                  <Dialog.Title className="text-lg font-semibold mb-4">
                    Edit Workspace
                  </Dialog.Title>
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    const form = new FormData(e.currentTarget)
                    handleUpdate({
                      name: form.get("name"),
                      description: form.get("description"),
                      emoji: form.get("emoji"),
                      isPublic: form.get("isPublic") === "on",
                    })
                  }} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Emoji</label>
                      <Input name="emoji" defaultValue={workspace.emoji} maxLength={2} className="text-lg" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Name</label>
                      <Input name="name" required defaultValue={workspace.name} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Description</label>
                      <Input name="description" defaultValue={workspace.description || ""} />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium" htmlFor="isPublic">Public workspace</label>
                      <Switch.Root
                        defaultChecked={workspace.isPublic}
                        name="isPublic"
                        id="isPublic"
                        className="w-[42px] h-[25px] bg-muted rounded-full relative data-[state=checked]:bg-primary outline-none"
                      >
                        <Switch.Thumb className="block w-[21px] h-[21px] bg-background rounded-full shadow-sm transition-transform duration-100 translate-x-0.5 data-[state=checked]:translate-x-[19px]" />
                      </Switch.Root>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Dialog.Close asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                      </Dialog.Close>
                      <Button type="submit">Save</Button>
                    </div>
                  </form>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search within workspace..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs.Root value={tab} onValueChange={setTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <Tabs.List className="flex gap-1 rounded-xl bg-muted p-1">
              <Tabs.Trigger
                value="tools"
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                  "data-[state=inactive]:text-muted-foreground hover:text-foreground"
                )}
              >
                <Wrench className="h-4 w-4" />
                Tools ({toolItems.length})
              </Tabs.Trigger>
              <Tabs.Trigger
                value="notes"
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                  "data-[state=inactive]:text-muted-foreground hover:text-foreground"
                )}
              >
                <StickyNote className="h-4 w-4" />
                Notes ({noteItems.length})
              </Tabs.Trigger>
              <Tabs.Trigger
                value="prompts"
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                  "data-[state=inactive]:text-muted-foreground hover:text-foreground"
                )}
              >
                <FileText className="h-4 w-4" />
                Prompts ({promptItems.length})
              </Tabs.Trigger>
              <Tabs.Trigger
                value="workflow"
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                  "data-[state=inactive]:text-muted-foreground hover:text-foreground"
                )}
              >
                <Workflow className="h-4 w-4" />
                Workflow ({workflowItems.length})
              </Tabs.Trigger>
            </Tabs.List>
          </div>

          <Tabs.Content value="tools" className="space-y-4">
            <div className="flex justify-end">
              <Dialog.Root open={addToolDialogOpen} onOpenChange={setAddToolDialogOpen}>
                <Dialog.Trigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Tool
                  </Button>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
                  <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[80vh] rounded-xl border bg-background p-6 shadow-lg z-50 overflow-y-auto">
                    <Dialog.Title className="text-lg font-semibold mb-4">
                      Add Tool to Workspace
                    </Dialog.Title>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search AI tools..."
                        value={toolSearch}
                        onChange={(e) => setToolSearch(e.target.value)}
                        className="pl-9"
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {searching ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div className="space-y-1.5 flex-1">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-48" />
                            </div>
                          </div>
                        ))
                      ) : searchResults.length === 0 && toolSearch ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No tools found</p>
                      ) : (
                        searchResults.map((tool) => {
                          const added = toolItems.some((i) => i.toolId === tool.id)
                          return (
                            <button
                              key={tool.id}
                              disabled={added}
                              onClick={() => handleAddTool(tool.id)}
                              className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-accent transition-colors text-left disabled:opacity-40"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-secondary text-sm font-bold text-primary overflow-hidden">
                                {tool.logo ? (
                                  <img src={tool.logo} alt={tool.name} className="h-full w-full object-contain p-1" />
                                ) : (
                                  tool.name.charAt(0)
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{tool.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{tool.tagline}</p>
                              </div>
                              {added && (
                                <Badge variant="secondary" className="text-[10px] shrink-0">Added</Badge>
                              )}
                            </button>
                          )
                        })
                      )}
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </div>

            {toolItems.length === 0 ? (
              <EmptyState
                icon={Wrench}
                title="No tools yet"
                description="Start building your workspace by adding AI tools you use. Search and add tools to keep everything in one place."
                action={<Button onClick={() => setAddToolDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Add your first tool</Button>}
              />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {toolItems.map((item) => item.tool && (
                  <div key={item.id} className="relative group">
                    <ToolCard tool={item.tool} />
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-background/80 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all shadow-sm border"
                      aria-label="Remove from workspace"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Tabs.Content>

          <Tabs.Content value="notes" className="space-y-4">
            <div className="flex justify-end">
              <Dialog.Root open={addNoteOpen} onOpenChange={setAddNoteOpen}>
                <Dialog.Trigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Note
                  </Button>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
                  <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-xl border bg-background p-6 shadow-lg z-50">
                    <Dialog.Title className="text-lg font-semibold mb-4">Add Note</Dialog.Title>
                    <div className="space-y-4">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Write your note..."
                        className="flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <Dialog.Close asChild>
                          <Button type="button" variant="outline">Cancel</Button>
                        </Dialog.Close>
                        <Button onClick={handleAddNote} disabled={addingNote || !noteText.trim()}>
                          {addingNote ? "Adding..." : "Add Note"}
                        </Button>
                      </div>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </div>

            {noteItems.length === 0 ? (
              <EmptyState
                icon={StickyNote}
                title="No notes yet"
                description="Jot down ideas, observations, and tips about your AI tools. Notes help you remember what works best."
                action={<Button onClick={() => setAddNoteOpen(true)}><Plus className="mr-2 h-4 w-4" />Write a note</Button>}
              />
            ) : (
              <div className="space-y-3">
                {noteItems.map((item) => (
                  <Card key={item.id} className="p-4">
                    {editingNote === item.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={noteValue}
                          onChange={(e) => setNoteValue(e.target.value)}
                          className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingNote(null)}>Cancel</Button>
                          <Button size="sm" onClick={() => handleUpdateNote(item.id)} disabled={savingNote}>
                            {savingNote ? "Saving..." : "Save"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-secondary">
                          <StickyNote className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm whitespace-pre-wrap">{item.note}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => { setEditingNote(item.id); setNoteValue(item.note || "") }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-accent transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            aria-label="Delete note"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </Tabs.Content>

          <Tabs.Content value="prompts" className="space-y-4">
            {promptItems.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No prompts saved"
                description="Save prompts from the Prompt Library and access them right inside your workspace alongside your tools."
                action={<Link href="/prompts"><Button variant="outline"><BookOpen className="mr-2 h-4 w-4" />Browse Prompt Library</Button></Link>}
              />
            ) : (
              <div className="space-y-4">
                {promptItems.map((item) => item.prompt && (
                  <Card key={item.id} className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-secondary text-sm font-bold text-primary overflow-hidden">
                          {item.prompt.tool.logo ? (
                            <img src={item.prompt.tool.logo} alt={item.prompt.tool.name} className="h-full w-full object-contain p-1" />
                          ) : (
                            item.prompt.tool.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{item.prompt.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {item.prompt.tool.name}
                            {item.prompt.category && <> &middot; {item.prompt.category}</>}
                            {item.prompt.difficulty && <> &middot; {item.prompt.difficulty}</>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Link href={`/prompts/${item.prompt.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="View prompt details">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          aria-label="Remove prompt from workspace"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4 bg-muted/50 rounded-lg p-3 font-mono text-xs">
                      {item.prompt.content}
                    </p>
                    {item.prompt.description && (
                      <p className="text-xs text-muted-foreground mt-2">{item.prompt.description}</p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </Tabs.Content>

          <Tabs.Content value="workflow" className="space-y-4">
            {workflowItems.length === 0 ? (
              <EmptyState
                icon={Workflow}
                title="No workflow yet"
                description="Build a pipeline by adding tools and arranging them in order. Define each step to create a repeatable process."
                action={<Button variant="outline" onClick={() => setAddToolDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Add tools to get started</Button>}
              />
            ) : (
              <div className="space-y-2">
                {workflowItems.map((item, index) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
                        {index + 1}
                      </div>
                      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />
                      {item.tool && (
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-secondary text-xs font-bold text-primary overflow-hidden">
                            {item.tool.logo ? (
                              <img src={item.tool.logo} alt={item.tool.name} className="h-full w-full object-contain p-1" />
                            ) : (
                              item.tool.name.charAt(0)
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.tool.name}</p>
                            {item.workflow && (
                              <p className="text-xs text-muted-foreground truncate">{item.workflow}</p>
                            )}
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        aria-label="Delete workflow step"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  )
}

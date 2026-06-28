"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Archive, MoreHorizontal, Pencil, Copy, Trash2, ArchiveRestore, FolderKanban } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { useToast } from "@/components/toast"
import { Badge } from "@/components/ui/badge"
import * as Dialog from "@radix-ui/react-dialog"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { cn, formatDate } from "@/lib/utils"

interface Workspace {
  id: string
  name: string
  description: string | null
  emoji: string
  isPublic: boolean
  archived: boolean
  createdAt: string
  updatedAt: string
  _count: { items: number }
}

export default function WorkspacesPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showArchived, setShowArchived] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const fetchWorkspaces = useCallback(async (q?: string, archived?: boolean) => {
    try {
      const params = new URLSearchParams()
      if (q) params.set("search", q)
      if (archived) params.set("archived", "true")
      const res = await fetch(`/api/workspaces?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setWorkspaces(data.data)
      }
    } catch {
      showToast("Failed to load workspaces", "error")
    }
    setLoading(false)
  }, [showToast])

  useEffect(() => {
    Promise.resolve().then(() => fetchWorkspaces(search, showArchived))
  }, [search, showArchived, fetchWorkspaces])

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCreating(true)
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          description: form.get("description"),
          emoji: form.get("emoji") || "💼",
        }),
      })
      if (res.ok) {
        showToast("Workspace created", "success")
        setCreateOpen(false)
        fetchWorkspaces(search, showArchived)
      } else {
        const data = await res.json()
        showToast(data.error || "Failed to create", "error")
      }
    } catch {
      showToast("Failed to create workspace", "error")
    }
    setCreating(false)
  }

  async function handleRename(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const id = renameOpen
    if (!id) return
    try {
      const res = await fetch(`/api/workspaces/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          description: form.get("description"),
          emoji: form.get("emoji"),
        }),
      })
      if (res.ok) {
        showToast("Workspace updated", "success")
        setRenameOpen(null)
        fetchWorkspaces()
      } else {
        const data = await res.json()
        showToast(data.error || "Failed to update", "error")
      }
    } catch {
      showToast("Failed to update workspace", "error")
    }
  }

  async function handleDuplicate(id: string) {
    try {
      const res = await fetch(`/api/workspaces/${id}/duplicate`, { method: "POST" })
      if (res.ok) {
        showToast("Workspace duplicated", "success")
        fetchWorkspaces()
      } else {
        const data = await res.json()
        showToast(data.error || "Failed to duplicate", "error")
      }
    } catch {
      showToast("Failed to duplicate workspace", "error")
    }
  }

  async function handleArchive(id: string, archived: boolean) {
    try {
      const res = await fetch(`/api/workspaces/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived }),
      })
      if (res.ok) {
        showToast(archived ? "Workspace archived" : "Workspace restored", "success")
        fetchWorkspaces()
      }
    } catch {
      showToast("Failed to update workspace", "error")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this workspace permanently?")) return
    try {
      const res = await fetch(`/api/workspaces/${id}`, { method: "DELETE" })
      if (res.ok) {
        showToast("Workspace deleted", "success")
        fetchWorkspaces()
      }
    } catch {
      showToast("Failed to delete workspace", "error")
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
            <p className="mt-2 text-muted-foreground">
              Organize your AI tools, prompts, and notes
            </p>
          </div>
          <Dialog.Root open={createOpen} onOpenChange={setCreateOpen}>
            <Dialog.Trigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Workspace
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
              <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-xl border bg-background p-6 shadow-lg z-50">
                <Dialog.Title className="text-lg font-semibold mb-4">
                  Create Workspace
                </Dialog.Title>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Emoji</label>
                    <Input name="emoji" defaultValue="💼" maxLength={2} className="text-lg" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Name *</label>
                    <Input name="name" required placeholder="My Workspace" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Description</label>
                    <Input name="description" placeholder="What is this workspace for?" />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Dialog.Close asChild>
                      <Button type="button" variant="outline">Cancel</Button>
                    </Dialog.Close>
                    <Button type="submit" disabled={creating}>
                      {creating ? "Creating..." : "Create"}
                    </Button>
                  </div>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workspaces..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant={showArchived ? "default" : "outline"}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className="shrink-0"
          >
            <Archive className="mr-2 h-4 w-4" />
            {showArchived ? "Showing Archived" : "Show Archived"}
          </Button>
        </div>

        <Dialog.Root open={!!renameOpen} onOpenChange={(o) => !o && setRenameOpen(null)}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-xl border bg-background p-6 shadow-lg z-50">
              {renameOpen && (() => {
                const ws = workspaces.find((w) => w.id === renameOpen)
                return (
                  <>
                    <Dialog.Title className="text-lg font-semibold mb-4">
                      Edit Workspace
                    </Dialog.Title>
                    <form onSubmit={handleRename} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Emoji</label>
                        <Input name="emoji" defaultValue={ws?.emoji} maxLength={2} className="text-lg" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Name</label>
                        <Input name="name" required defaultValue={ws?.name} />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Description</label>
                        <Input name="description" defaultValue={ws?.description || ""} />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Dialog.Close asChild>
                          <Button type="button" variant="outline">Cancel</Button>
                        </Dialog.Close>
                        <Button type="submit">Save</Button>
                      </div>
                    </form>
                  </>
                )
              })()}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-5 space-y-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/3" />
              </Card>
            ))}
          </div>
        ) : workspaces.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No workspaces yet"
            description={search ? "No workspaces match your search. Try a different keyword." : "Workspaces help you organize your AI tools, notes, and prompts in one place. Create one to get started."}
            action={
              !search ? (
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Workspace
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((workspace) => (
              <Card
                key={workspace.id}
                className={cn(
                  "group relative p-5 cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-300",
                  workspace.archived && "opacity-60"
                )}
                onClick={() => router.push(`/workspaces/${workspace.id}`)}
              >
                <CardContent className="p-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border bg-secondary text-xl">
                      {workspace.emoji}
                    </div>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="flex h-8 w-8 items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-accent transition-all"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content className="z-50 min-w-[160px] rounded-xl border bg-background p-1 shadow-lg" sideOffset={5}>
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent cursor-pointer outline-none"
                            onClick={(e) => { e.stopPropagation(); setRenameOpen(workspace.id) }}
                          >
                            <Pencil className="h-4 w-4" />
                            Rename
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent cursor-pointer outline-none"
                            onClick={(e) => { e.stopPropagation(); handleDuplicate(workspace.id) }}
                          >
                            <Copy className="h-4 w-4" />
                            Duplicate
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent cursor-pointer outline-none"
                            onClick={(e) => { e.stopPropagation(); handleArchive(workspace.id, !workspace.archived) }}
                          >
                            {workspace.archived ? (
                              <><ArchiveRestore className="h-4 w-4" /> Restore</>
                            ) : (
                              <><Archive className="h-4 w-4" /> Archive</>
                            )}
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator className="my-1 h-px bg-border" />
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent text-destructive cursor-pointer outline-none"
                            onClick={(e) => { e.stopPropagation(); handleDelete(workspace.id) }}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </div>

                  <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                    {workspace.name}
                  </h3>
                  {workspace.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {workspace.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span>{workspace._count.items} item{workspace._count.items !== 1 ? "s" : ""}</span>
                    <span>Updated {formatDate(workspace.updatedAt)}</span>
                    {workspace.archived && (
                      <Badge variant="secondary" className="text-[10px]">Archived</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

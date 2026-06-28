"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Heart, Copy, Share2, Layers, MessageCircle, Edit3, Trash2,
  Globe, Lock, ChevronRight, GripVertical, Plus, ArrowLeft, Check, X,
  Sparkles, MessageSquare, Wrench, Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { ShareButton } from "@/components/shared/share-button"
import { EmptyState } from "@/components/shared/empty-state"
import { useUser } from "@/hooks/use-user"
import { formatDate } from "@/lib/utils"

export default function StackDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { user } = useUser()
  const [stack, setStack] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [liked, setLiked] = React.useState(false)
  const [likeCount, setLikeCount] = React.useState(0)
  const [comments, setComments] = React.useState<any[]>([])
  const [commentText, setCommentText] = React.useState("")
  const [editing, setEditing] = React.useState(false)
  const [editName, setEditName] = React.useState("")
  const [editDesc, setEditDesc] = React.useState("")
  const [editEmoji, setEditEmoji] = React.useState("")
  const [editPublic, setEditPublic] = React.useState(true)
  const [dragIndex, setDragIndex] = React.useState<number | null>(null)
  const [showAddTool, setShowAddTool] = React.useState(false)
  const [toolSearch, setToolSearch] = React.useState("")
  const [toolResults, setToolResults] = React.useState<any[]>([])

  const isOwner = user && stack && user.id === stack.userId

  const fetchStack = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/stacks/${id}`)
      const data = await res.json()
      setStack(data)
      setLikeCount(data.likeCount || 0)
    } catch (error) {
      console.error("[STACK_DETAIL] Failed to fetch stack", error)
    } finally {
      setLoading(false)
    }
  }, [id])

  const fetchComments = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/stacks/${id}/comments`)
      const data = await res.json()
      setComments(data)
    } catch (error) {
      console.error("[STACK_DETAIL] Failed to fetch comments", error)
    }
  }, [id])

  React.useEffect(() => {
    const doFetchStack = async () => {
      try {
        const res = await fetch(`/api/stacks/${id}`)
        const data = await res.json()
        setStack(data)
        setLikeCount(data.likeCount || 0)
      } catch (error) {
        console.error("[STACK_DETAIL] Failed to fetch stack", error)
      } finally {
        setLoading(false)
      }
    }
    const doFetchComments = async () => {
      try {
        const res = await fetch(`/api/stacks/${id}/comments`)
        const data = await res.json()
        setComments(data)
      } catch (error) {
        console.error("[STACK_DETAIL] Failed to fetch comments", error)
      }
    }
    doFetchStack()
    doFetchComments()
  }, [id])

  React.useEffect(() => {
    if (!toolSearch.trim()) return
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tools?q=${encodeURIComponent(toolSearch)}&limit=5`)
        const data = await res.json()
        setToolResults(data.items || [])
      } catch (error) {
        console.error("[STACK_DETAIL] Tool search failed", error)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [toolSearch])

  async function handleLike() {
    if (!user) return
    try {
      const res = await fetch(`/api/stacks/${id}/like`, { method: "POST" })
      const data = await res.json()
      setLiked(data.liked)
      setLikeCount(data.likeCount)
    } catch (error) {
      console.error("[STACK_DETAIL] Failed to like", error)
    }
  }

  async function handleClone() {
    if (!user) return
    try {
      const res = await fetch(`/api/stacks/${id}/clone`, { method: "POST" })
      if (res.ok) {
        const cloned = await res.json()
        router.push(`/stacks/${cloned.id}`)
      }
    } catch (error) {
      console.error("[STACK_DETAIL] Failed to clone", error)
    }
  }

  async function handleAddComment() {
    if (!commentText.trim()) return
    try {
      const res = await fetch(`/api/stacks/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText }),
      })
      if (res.ok) {
        setCommentText("")
        fetchComments()
      }
    } catch (error) {
      console.error("[STACK_DETAIL] Failed to add comment", error)
    }
  }

  async function handleSaveEdit() {
    try {
      const res = await fetch(`/api/stacks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          description: editDesc,
          emoji: editEmoji,
          isPublic: editPublic,
        }),
      })
      if (res.ok) {
        setEditing(false)
        fetchStack()
      }
    } catch (error) {
      console.error("[STACK_DETAIL] Failed to save edit", error)
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this stack?")) return
    try {
      const res = await fetch(`/api/stacks/${id}`, { method: "DELETE" })
      if (res.ok) router.push("/stacks")
    } catch (error) {
      console.error("[STACK_DETAIL] Failed to delete", error)
    }
  }

  function handleDragStart(index: number) {
    setDragIndex(index)
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    const items = [...(stack.items || [])]
    const [moved] = items.splice(dragIndex, 1)
    items.splice(index, 0, moved)
    setDragIndex(index)
    setStack({ ...stack, items })
  }

  function handleDragEnd() {
    if (dragIndex === null) return
    const itemIds = (stack.items || []).map((i: any) => i.id)
    fetch(`/api/stacks/${id}/items`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemIds }),
    }).catch((error: unknown) => {
      console.error("[STACK_DETAIL] Failed to reorder items", error)
    })
    setDragIndex(null)
  }

  async function handleAddTool(toolId: string) {
    try {
      const res = await fetch(`/api/stacks/${id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId }),
      })
      if (res.ok) {
        setShowAddTool(false)
        setToolSearch("")
        fetchStack()
      }
    } catch (error) {
      console.error("[STACK_DETAIL] Failed to add tool", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
          <Skeleton className="h-4 w-48" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!stack) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <EmptyState icon={Search} title="Stack not found" description="This stack doesn't exist or has been removed" />
      </div>
    )
  }

  const items = stack.items || []
  const usedTools = new Set(items.map((i: any) => i.toolId))

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[
          { label: "Stacks", href: "/stacks" },
          { label: stack.name },
        ]} />

        <div className="flex items-start gap-5 mb-6">
          {stack.emoji ? (
            <span className="text-4xl">{stack.emoji}</span>
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary">
              <Wrench className="h-7 w-7 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight">{stack.name}</h1>
              <Badge variant={stack.isPublic ? "success" : "secondary"} className="gap-1">
                {stack.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                {stack.isPublic ? "Public" : "Private"}
              </Badge>
            </div>
            {stack.description && (
              <p className="text-muted-foreground mt-1">{stack.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              {stack.user && (
                <span className="flex items-center gap-1.5">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[10px]">
                      {stack.user.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  {stack.user.name || "Anonymous"}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Layers className="h-3.5 w-3.5" />
                {items.length} tools
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {likeCount}
              </span>
              <span className="flex items-center gap-1">
                <Copy className="h-3.5 w-3.5" />
                {stack.cloneCount}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                {comments.length}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <Button variant="outline" size="sm" onClick={handleLike} disabled={!user}>
            <Heart className={`mr-1.5 h-4 w-4 ${liked ? "fill-current text-red-500" : ""}`} />
            {liked ? "Liked" : "Like"} ({likeCount})
          </Button>
          <Button variant="outline" size="sm" onClick={handleClone} disabled={!user}>
            <Copy className="mr-1.5 h-4 w-4" />
            Clone
          </Button>
          <ShareButton title={stack.name} url={`/stacks/${id}`} />
          {isOwner && (
            <>
              <Button variant="outline" size="sm" onClick={() => {
                setEditing(true)
                setEditName(stack.name)
                setEditDesc(stack.description || "")
                setEditEmoji(stack.emoji || "🔧")
                setEditPublic(stack.isPublic)
              }}>
                <Edit3 className="mr-1.5 h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="mr-1.5 h-4 w-4" />
                Delete
              </Button>
            </>
          )}
        </div>

        {editing && (
          <Card className="mb-8">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Edit Stack</h3>
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-3">
                <Input
                  placeholder="Emoji"
                  value={editEmoji}
                  onChange={(e) => setEditEmoji(e.target.value)}
                  className="w-16 text-center text-lg"
                />
                <div className="flex-1 space-y-3">
                  <Input
                    placeholder="Name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <Input
                    placeholder="Description"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={editPublic}
                  onChange={(e) => setEditPublic(e.target.checked)}
                  className="rounded"
                />
                Public stack
              </label>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                <Button size="sm" onClick={handleSaveEdit}>Save</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Pipeline</h2>
            {isOwner && (
              <Button variant="outline" size="sm" onClick={() => setShowAddTool(!showAddTool)}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add Tool
              </Button>
            )}
          </div>

          {showAddTool && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <Input
                  placeholder="Search tools to add..."
                  value={toolSearch}
                  onChange={(e) => setToolSearch(e.target.value)}
                  className="mb-3"
                />
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {toolResults
                    .filter((t: any) => !usedTools.has(t.id))
                    .map((tool: any) => (
                      <button
                        key={tool.id}
                        onClick={() => handleAddTool(tool.id)}
                        className="flex items-center gap-3 w-full rounded-lg p-2 hover:bg-accent text-left transition-colors"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-secondary text-xs font-bold text-primary">
                          {tool.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{tool.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{tool.tagline}</p>
                        </div>
                        <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                      </button>
                    ))}
                  {toolSearch && toolResults.filter((t: any) => !usedTools.has(t.id)).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No tools found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {items.length > 0 ? (
            <div className="space-y-0">
              {items.map((item: any, index: number) => {
                const tool = item.tool
                return (
                  <React.Fragment key={item.id}>
                    <Card
                      draggable={!!isOwner}
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`relative transition-shadow ${dragIndex === index ? "opacity-50 shadow-lg" : ""} ${isOwner ? "cursor-grab active:cursor-grabbing" : ""}`}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        {isOwner && (
                          <div className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                            <GripVertical className="h-5 w-5" />
                          </div>
                        )}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-secondary text-sm font-bold text-primary">
                          {tool?.name?.charAt(0) || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/ai-tool/${tool?.slug}`} className="font-medium hover:underline truncate block">
                            {tool?.name || "Unknown Tool"}
                          </Link>
                          <p className="text-sm text-muted-foreground truncate">
                            {tool?.tagline || ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {tool?.pricing && (
                            <Badge variant={
                              tool.pricing === "FREE" ? "success" :
                              tool.pricing === "FREEMIUM" ? "warning" : "secondary"
                            } className="text-[10px]">
                              {tool.pricing}
                            </Badge>
                          )}
                          {tool?.categories?.length > 0 && (
                            <span className="text-xs text-muted-foreground hidden sm:block">
                              {tool.categories[0]?.category?.name}
                            </span>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                    {index < items.length - 1 && (
                      <div className="flex justify-center py-1">
                        <div className="h-6 w-0.5 bg-gradient-to-b from-border to-border/20" />
                      </div>
                    )}
                  </React.Fragment>
                )
              })}
              {isOwner && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Drag to reorder
                </p>
              )}
            </div>
          ) : (
            <EmptyState
              icon={Sparkles}
              title="No tools in this stack yet"
              description={isOwner ? "Add your first tool to start building your AI stack." : "This stack doesn't have any tools yet."}
              action={isOwner ? <Button variant="outline" size="sm" onClick={() => setShowAddTool(true)}><Plus className="mr-1.5 h-4 w-4" />Add your first tool</Button> : undefined}
            />
          )}
        </section>

        <Separator className="mb-8" />

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">
            Comments ({comments.length})
          </h2>

          {user && (
            <div className="flex gap-3 mb-6">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs">
                  {user.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddComment() }}
                />
                <Button size="sm" onClick={handleAddComment} disabled={!commentText.trim()}>
                  Post
                </Button>
              </div>
            </div>
          )}

          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs">
                      {comment.user?.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {comment.user?.name || "Anonymous"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="No comments yet"
              description={user ? "No one has commented yet. Share your thoughts on this stack and start the discussion!" : "Sign in to leave a comment and join the discussion."}
            />
          )}
        </section>
      </div>
    </div>
  )
}

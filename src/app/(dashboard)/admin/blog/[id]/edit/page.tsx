"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/toast"

export default function EditBlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/blog/${params.id}`)
        const post = await res.json()
        if (post?.title) {
          const f = document.getElementById("edit-form") as HTMLFormElement
          if (f) {
            ;(f.elements.namedItem("title") as HTMLInputElement).value = post.title
            ;(f.elements.namedItem("author") as HTMLInputElement).value = post.author
            ;(f.elements.namedItem("excerpt") as HTMLTextAreaElement).value = post.excerpt || ""
            ;(f.elements.namedItem("content") as HTMLTextAreaElement).value = post.content
            ;(f.elements.namedItem("readTime") as HTMLInputElement).value = String(post.readTime)
            ;(f.elements.namedItem("tags") as HTMLInputElement).value = post.tags || ""
          }
        }
      } catch (error) {
        console.error("[BLOG_EDIT] Failed to load post", error)
      }
      setFetching(false)
    }
    load()
  }, [params.id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const slug = (form.get("title") as string).toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
    try {
      const res = await fetch(`/api/blog/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          slug,
          excerpt: form.get("excerpt"),
          content: form.get("content"),
          author: form.get("author"),
          readTime: parseInt(form.get("readTime") as string) || 5,
          tags: form.get("tags"),
        }),
      })
      if (res.ok) { showToast("Post updated!", "success"); router.push("/admin/blog") }
      else { showToast("Update failed", "error") }
    } catch { showToast("Update failed", "error") }
    setLoading(false)
  }

  if (fetching) return <div className="text-center py-8 text-muted-foreground">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Blog Post</h1>
      <Card><CardContent className="pt-6">
        <form id="edit-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" name="title" required /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="author">Author</Label><Input id="author" name="author" required /></div>
            <div className="space-y-2"><Label htmlFor="readTime">Read Time</Label><Input id="readTime" name="readTime" type="number" /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="excerpt">Excerpt</Label>
            <textarea id="excerpt" name="excerpt" rows={2} className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div className="space-y-2"><Label htmlFor="content">Content</Label>
            <textarea id="content" name="content" rows={15} className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono" required />
          </div>
          <div className="space-y-2"><Label htmlFor="tags">Tags</Label><Input id="tags" name="tags" /></div>
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/blog")}>Cancel</Button>
          </div>
        </form>
      </CardContent></Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/toast"

export default function NewBlogPostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const slug = (form.get("title") as string).toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 200)
    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          slug,
          excerpt: form.get("excerpt"),
          content: form.get("content"),
          author: form.get("author"),
          readTime: parseInt(form.get("readTime") as string) || 5,
          tags: form.get("tags"),
          published: form.get("published") === "on",
        }),
      })
      if (res.ok) { showToast("Post created!", "success"); router.push("/admin/blog") }
      else { const d = await res.json(); showToast(d.error || "Failed", "error") }
    } catch { showToast("Failed to create post", "error") }
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Blog Post</h1>
      <Card><CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" name="title" required /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="author">Author</Label><Input id="author" name="author" required /></div>
            <div className="space-y-2"><Label htmlFor="readTime">Read Time (min)</Label><Input id="readTime" name="readTime" type="number" defaultValue={5} /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="excerpt">Excerpt</Label>
            <textarea id="excerpt" name="excerpt" rows={2} className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div className="space-y-2"><Label htmlFor="content">Content (Markdown)</Label>
            <textarea id="content" name="content" rows={15} className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono" required />
          </div>
          <div className="space-y-2"><Label htmlFor="tags">Tags (comma-separated)</Label><Input id="tags" name="tags" placeholder="AI, guides, tutorials" /></div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="published" name="published" className="rounded border-input" />
            <Label htmlFor="published">Publish immediately</Label>
          </div>
          <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Post"}</Button>
        </form>
      </CardContent></Card>
    </div>
  )
}

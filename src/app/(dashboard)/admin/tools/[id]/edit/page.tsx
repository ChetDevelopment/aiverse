"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/toast"

export default function EditToolPage() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const slug = form.get("slug") as string
    const body = JSON.stringify({
      name: form.get("name") as string,
      slug,
      tagline: form.get("tagline") as string,
      description: form.get("description") as string,
      websiteUrl: form.get("websiteUrl") as string,
      pricing: form.get("pricing") as string,
      pricingDetail: form.get("pricingDetail") as string || undefined,
      categoryIds: [form.get("categoryId") as string].filter(Boolean),
    })

    try {
      const res = await fetch(`/api/tools/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body,
      })
      if (res.ok) {
        showToast("Tool updated!", "success")
        router.push("/admin/tools")
      } else {
        const err = await res.json()
        showToast(err.error || "Update failed", "error")
      }
    } catch {
      showToast("Update failed", "error")
    }
    setLoading(false)
  }

  useEffect(() => {
    fetch(`/api/tools/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.name) {
          const form = document.getElementById("edit-form") as HTMLFormElement
          if (form) {
            ;(form.elements.namedItem("name") as HTMLInputElement).value = data.name
            ;(form.elements.namedItem("slug") as HTMLInputElement).value = data.slug
            ;(form.elements.namedItem("tagline") as HTMLInputElement).value = data.tagline
            ;(form.elements.namedItem("description") as HTMLTextAreaElement).value = data.description
            ;(form.elements.namedItem("websiteUrl") as HTMLInputElement).value = data.websiteUrl
            ;(form.elements.namedItem("pricing") as HTMLSelectElement).value = data.pricing
            ;(form.elements.namedItem("pricingDetail") as HTMLInputElement).value = data.pricingDetail || ""
          }
        }
        setFetching(false)
      })
      .catch(() => setFetching(false))
  }, [params.id])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Tool</h1>
      <Card>
        <CardContent className="pt-6">
          {fetching ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <form id="edit-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tool Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" name="slug" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input id="tagline" name="tagline" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea id="description" name="description" rows={5}
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input id="websiteUrl" name="websiteUrl" type="url" required />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pricing">Pricing</Label>
                  <select id="pricing" name="pricing"
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                    <option value="FREE">Free</option>
                    <option value="FREEMIUM">Freemium</option>
                    <option value="PAID">Paid</option>
                    <option value="CONTACT">Contact</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricingDetail">Pricing Detail</Label>
                  <Input id="pricingDetail" name="pricingDetail" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/admin/tools")}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

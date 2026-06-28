"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export default function NewToolPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const data = {
      name: form.get("name"),
      slug: form.get("slug"),
      tagline: form.get("tagline"),
      description: form.get("description"),
      websiteUrl: form.get("websiteUrl"),
      pricing: form.get("pricing"),
      pricingDetail: form.get("pricingDetail"),
      categoryIds: [form.get("categoryId")],
    }
    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) router.push("/admin")
    } catch (error) {
      console.error("[ADMIN_TOOLS_NEW] Failed to create tool", error)
    }
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New AI Tool</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tool Name</Label>
                <Input id="name" name="name" placeholder="e.g. ChatGPT" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" name="slug" placeholder="e.g. chatgpt" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" name="tagline" placeholder="Short description" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea id="description" name="description" rows={5}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input id="websiteUrl" name="websiteUrl" type="url" placeholder="https://" required />
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
                <Input id="pricingDetail" name="pricingDetail" placeholder="e.g. Starts at $20/mo" />
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Tool"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

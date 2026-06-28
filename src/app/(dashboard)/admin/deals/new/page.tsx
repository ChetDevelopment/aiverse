"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/toast"

export default function NewDealPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const slug = (form.get("toolName") as string).toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolName: form.get("toolName"),
          toolSlug: slug,
          description: form.get("description"),
          dealType: form.get("dealType"),
          promoCode: form.get("promoCode") || undefined,
          link: form.get("link"),
          verified: true,
        }),
      })
      if (res.ok) { showToast("Deal added!", "success"); router.push("/admin/deals") }
      else { const d = await res.json(); showToast(d.error || "Failed", "error") }
    } catch { showToast("Failed", "error") }
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Free Deal</h1>
      <Card><CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="toolName">Tool Name</Label><Input id="toolName" name="toolName" required /></div>
            <div className="space-y-2"><Label htmlFor="dealType">Deal Type</Label>
              <select id="dealType" name="dealType" className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                <option value="free-tier">Free Tier</option>
                <option value="promo-code">Promo Code</option>
                <option value="lifetime-deal">Lifetime Deal</option>
                <option value="open-source">Open Source</option>
                <option value="student">Student Deal</option>
              </select>
            </div>
          </div>
          <div className="space-y-2"><Label htmlFor="description">Description</Label>
            <textarea id="description" name="description" rows={3} className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" required />
          </div>
          <div className="space-y-2"><Label htmlFor="link">Deal URL</Label><Input id="link" name="link" type="url" placeholder="https://" required /></div>
          <div className="space-y-2"><Label htmlFor="promoCode">Promo Code (optional)</Label><Input id="promoCode" name="promoCode" /></div>
          <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Deal"}</Button>
        </form>
      </CardContent></Card>
    </div>
  )
}

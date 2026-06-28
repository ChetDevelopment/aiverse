"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/toast"

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 500))
    showToast("Settings would be saved in production", "info")
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader><CardTitle>Site Information</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input id="siteName" defaultValue="AIVerse" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Input id="siteDescription" defaultValue="Discover the best AI tools for every task" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input id="siteUrl" defaultValue={typeof window !== "undefined" ? window.location.origin : ""} />
              </div>
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Settings"}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Social Links</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter URL</Label>
                <Input id="twitter" placeholder="https://twitter.com/aiverse" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub URL</Label>
                <Input id="github" placeholder="https://github.com/aiverse" />
              </div>
              <Button type="submit" disabled={loading}>Save Social Links</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

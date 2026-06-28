"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/toast"
import { ExternalLink, Check, X } from "lucide-react"

interface Project {
  id: string; repoName: string; repoOwner: string; fullName: string
  githubUrl: string; description: string | null; stars: number; forks: number
  language: string | null; topics: string | null; license: string | null
  category: string | null; summary: string | null; status: string
  discoveredAt: string; logoUrl: string | null
}

export default function AdminDiscoverPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("PENDING")
  const { showToast } = useToast()

  useEffect(() => {
    fetch("/api/discover/projects")
      .then((r) => r.json())
      .then((data) => {
        if (data?.projects) { setProjects(data.projects); setCounts(data.counts) }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function updateStatus(id: string, status: string) {
    const res = await fetch("/api/discover/projects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id))
      setCounts((prev) => ({
        ...prev,
        [status.toLowerCase()]: prev[status.toLowerCase() as keyof typeof prev] + 1,
        [filter.toLowerCase()]: Math.max(0, prev[filter.toLowerCase() as keyof typeof prev] - 1),
      }))
      showToast(`Project ${status.toLowerCase()}!`, "success")
    } else {
      showToast("Failed to update", "error")
    }
  }

  async function runDiscovery() {
    showToast("Running discovery...", "info")
    const res = await fetch("/api/discover/run", { method: "POST" })
    if (res.ok) {
      const data = await res.json()
      showToast(`Found ${data.newDiscovered} new projects!`, "success")
      window.location.reload()
    } else {
      showToast("Discovery failed", "error")
    }
  }

  const filtered = projects.filter((p) => filter === "ALL" || p.status === filter)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Auto Discovery</h1>
          {counts && (
            <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
              <span className="text-amber-500">{counts.pending} pending</span>
              <span className="text-emerald-500">{counts.approved} approved</span>
              <span className="text-destructive">{counts.rejected} rejected</span>
            </div>
          )}
        </div>
        <Button onClick={runDiscovery}>
          <ExternalLink className="mr-2 h-4 w-4" /> Run Discovery
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        {["PENDING", "APPROVED", "REJECTED", "ALL"].map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No projects found.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((project) => (
            <Card key={project.id} className={project.status === "PENDING" ? "border-amber-500/30" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-secondary text-sm font-bold overflow-hidden">
                      {project.logoUrl ? (
                        <img src={project.logoUrl} alt="" className="h-full w-full object-contain" />
                      ) : (
                        project.repoName.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-primary truncate">
                          {project.repoOwner}/{project.repoName}
                        </a>
                        {project.category && <Badge variant="secondary" className="text-[10px]">{project.category}</Badge>}
                        {project.language && <Badge variant="outline" className="text-[10px]">{project.language}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{project.description}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span>⭐ {project.stars.toLocaleString()}</span>
                        <span>⑂ {project.forks.toLocaleString()}</span>
                        {project.license && <span>{project.license}</span>}
                        {project.topics && <span className="truncate max-w-[200px]">{project.topics.slice(0, 60)}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-1 shrink-0 ml-3">
                    {project.status === "PENDING" && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => updateStatus(project.id, "APPROVED")} className="text-emerald-500 h-8 w-8 p-0">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => updateStatus(project.id, "REJECTED")} className="text-destructive h-8 w-8 p-0">
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {project.status !== "PENDING" && (
                      <Badge variant={project.status === "APPROVED" ? "success" : "secondary"}>
                        {project.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

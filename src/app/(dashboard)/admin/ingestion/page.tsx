"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, Download, GitBranch, FileText, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react"

interface LogEntry {
  id: string
  sourceType: string
  status: string
  itemsFound: number
  itemsCreated: number
  itemsUpdated: number
  itemsSkipped: number
  itemsFailed: number
  errorCount: number
  errors: string | null
  startedAt: string
  completedAt: string | null
  duration: number | null
}

export default function AdminIngestionPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [counts, setCounts] = useState({ pendingProjects: 0, pendingPrompts: 0 })
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(id)
  }, [])

  async function fetchLogs() {
    setLoading(true)
    try {
      const res = await fetch("/api/ingest/run")
      const d = await res.json()
      const data = d?.data ?? d
      setLogs(data.logs || [])
      setCounts(data.counts || { pendingProjects: 0, pendingPrompts: 0 })
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/ingest/run")
        const d = await res.json()
        const data = d?.data ?? d
        if (cancelled) return
        setLogs(data.logs || [])
        setCounts(data.counts || { pendingProjects: 0, pendingPrompts: 0 })
      } catch {}
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  async function runIngestion(source: string) {
    setRunning(source)
    try {
      const res = await fetch("/api/ingest/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source }),
      })
      const data = await res.json()
      await fetchLogs()
    } catch {}
    setRunning(null)
  }

  function timeAgo(date: string) {
    const s = Math.floor((now - new Date(date).getTime()) / 1000)
    if (s < 60) return "just now"
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    return `${Math.floor(s / 86400)}d ago`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Auto Ingestion</h1>
          <p className="text-muted-foreground">Daily auto-discovery of AI resources from public sources</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
              <GitBranch className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{counts.pendingProjects}</p>
              <p className="text-sm text-muted-foreground">Pending GitHub Projects</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{counts.pendingPrompts}</p>
              <p className="text-sm text-muted-foreground">Pending Prompts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
              <Download className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{logs.length}</p>
              <p className="text-sm text-muted-foreground">Total Ingestion Runs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Trigger */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Manual Ingestion</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => runIngestion("github")} disabled={running !== null} className="gap-2">
            {running === "github" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <GitBranch className="h-4 w-4" />}
            {running === "github" ? "Running..." : "Ingest GitHub Projects"}
          </Button>
          <Button onClick={() => runIngestion("prompts")} disabled={running !== null} variant="outline" className="gap-2">
            {running === "prompts" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            {running === "prompts" ? "Running..." : "Ingest Public Prompts"}
          </Button>
          <Button onClick={() => runIngestion("all")} disabled={running !== null} variant="secondary" className="gap-2">
            {running === "all" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {running === "all" ? "Running..." : "Run All"}
          </Button>
        </CardContent>
      </Card>

      {/* Log Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ingestion History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}</div>
          ) : logs.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">No ingestion runs yet. Click a button above to start.</p>
          ) : (
            <div className="divide-y">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 text-sm">
                  <div className="flex items-center gap-3">
                    {log.sourceType === "github" ? <GitBranch className="h-4 w-4 text-amber-500" /> : <FileText className="h-4 w-4 text-blue-500" />}
                    <div>
                      <p className="font-medium capitalize">{log.sourceType}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(log.startedAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {log.status === "running" && <Badge variant="outline" className="gap-1"><RefreshCw className="h-3 w-3 animate-spin" /> Running</Badge>}
                    {log.status === "completed" && <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" /> Done</Badge>}
                    {log.status === "failed" && <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Failed</Badge>}
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {log.itemsCreated > 0 && <span className="text-emerald-500">+{log.itemsCreated} </span>}
                      {log.itemsUpdated > 0 && <span className="text-blue-500">~{log.itemsUpdated} </span>}
                      {log.itemsSkipped > 0 && <span className="text-muted-foreground">-{log.itemsSkipped}</span>}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

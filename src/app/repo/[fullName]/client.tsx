"use client"

import { useState, useEffect, useRef } from "react"
import { Star, GitFork, Eye, Bug, ExternalLink, BookOpen, Users, Calendar, Clock, Download, File, Folder, Sparkles, GitCommit, Scale, Shield, Heart, Activity, BarChart3, Code, Box, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { GitHubRepoFull, GitHubContributor, GitHubRelease } from "@/lib/discovery/github-fetch"

// Types
interface FileItem { name: string; path: string; type: string; size: number }
interface Issue { number: number; title: string; state: string; body?: string; user: { login: string; avatar_url: string } | null; labels: { name: string; color: string }[]; comments: number; created_at: string; html_url: string }
interface Commit { sha: string; message: string; author: { name: string; avatar_url: string } | null; date: string; html_url: string }
interface RepoSection { category: string; files: { name: string; path: string; type: string; size: number; download_url?: string }[] }
interface Workflow { name: string; state: string; path: string }
interface Props { repo: GitHubRepoFull; readme: string; aiSummary?: string; languages: { name: string; percentage: number; color: string }[]; contributors: GitHubContributor[]; releases: GitHubRelease[] }

function Markdown({ content }: { content: string }) {
  if (!content) return <p className="text-muted-foreground italic">No content.</p>
  const h = content.replace(/### (.+)/g, "<h3 class='text-lg font-semibold mt-6 mb-2'>$1</h3>").replace(/## (.+)/g, "<h2 class='text-xl font-semibold mt-6 mb-2'>$1</h2>").replace(/# (.+)/g, "<h1 class='text-2xl font-bold mt-6 mb-3'>$1</h1>").replace(/```(\w*)\n([\s\S]*?)```/g, "<pre class='bg-secondary rounded-lg p-4 overflow-x-auto text-sm my-3'><code>$2</code></pre>").replace(/`([^`]+)`/g, "<code class='bg-secondary px-1.5 py-0.5 rounded text-sm text-primary'>$1</code>").replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href='$2' class='text-primary hover:underline' target='_blank'>$1</a>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>").replace(/^- (.+)/gm, "<li class='ml-4 list-disc text-muted-foreground'>$1</li>").replace(/\n\n/g, "</p><p class='text-muted-foreground leading-relaxed mb-3'>")
  return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: `<p class='text-muted-foreground leading-relaxed mb-3'>${h}</p>` }} />
}

export function RepoDetailClient({ repo, readme, aiSummary, languages, contributors, releases }: Props) {
  const [activeTab, setActiveTab] = useState("readme")
  const [files, setFiles] = useState<FileItem[]>([])
  const [issues, setIssues] = useState<{ open: Issue[]; closed: Issue[] } | null>(null)
  const [commits, setCommits] = useState<Commit[]>([])
  const [about, setAbout] = useState<{ categorized: RepoSection[]; features: Record<string, unknown>; workflows: Workflow[]; badges: { label: string; url: string }[] } | null>(null)
  const [traffic, setTraffic] = useState<Record<string, unknown> | null>(null)
  const [details, setDetails] = useState<Record<string, unknown> | null>(null)
  const [pullRequests, setPullRequests] = useState<Record<string, unknown> | null>(null)
  const [milestones, setMilestones] = useState<Record<string, unknown> | null>(null)
  const [security, setSecurity] = useState<Record<string, unknown> | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Record<string, unknown> | null>(null)
  const [copied, setCopied] = useState(false)
  const fetched = useRef<Record<string, boolean>>({})

  useEffect(() => {
    if (fetched.current[activeTab]) return
    fetched.current[activeTab] = true

    const fetchData = async (url: string) => { try { const r = await fetch(url); return await r.json() } catch { return null } }

    if (activeTab === "files") fetchData(`/api/github/files?full_name=${repo.full_name}`).then((d) => { if (d && Array.isArray(d)) setFiles(d) })
    if (activeTab === "issues") fetchData(`/api/github/issues?full_name=${repo.full_name}`).then((d) => setIssues(d))
    if (activeTab === "commits") fetchData(`/api/github/commits?full_name=${repo.full_name}`).then((d) => { if (Array.isArray(d)) setCommits(d) })
    if (activeTab === "community" || activeTab === "devops") fetchData(`/api/github/about?full_name=${repo.full_name}`).then((d) => setAbout(d))
    if (activeTab === "insights") fetchData(`/api/github/traffic?full_name=${repo.full_name}`).then((d) => setTraffic(d))
    if (!fetched.current.details) { fetched.current.details = true; fetchData(`/api/github/details?full_name=${repo.full_name}`).then((d) => setDetails(d)) }
    if (activeTab === "pulls") fetchData(`/api/github/pull-requests?full_name=${repo.full_name}`).then((d) => setPullRequests(d))
    if (activeTab === "milestones") fetchData(`/api/github/milestones?full_name=${repo.full_name}`).then((d) => setMilestones(d))
    if (activeTab === "security") fetchData(`/api/github/security?full_name=${repo.full_name}`).then((d) => setSecurity(d))
  }, [activeTab, repo.full_name])

  const searchRepo = async () => {
    if (!searchQuery.trim()) return
    const res = await fetch(`/api/github/search-code?full_name=${repo.full_name}&q=${encodeURIComponent(searchQuery)}`)
    const data = await res.json()
    setSearchResults(data)
  }

  const tabs = [
    { key: "readme", label: "README", icon: BookOpen },
    { key: "files", label: "Files", icon: Folder },
    { key: "issues", label: "Issues", icon: Bug },
    { key: "security", label: "Security", icon: Shield },
    { key: "pulls", label: "Pull Requests", icon: GitCommit },
    { key: "commits", label: "Commits", icon: Activity },
    { key: "community", label: "Community", icon: Heart },
    { key: "milestones", label: "Milestones", icon: Shield },
    { key: "devops", label: "DevOps", icon: Box },
    { key: "insights", label: "Insights", icon: BarChart3 },
    { key: "releases", label: "Releases", icon: Download },
    { key: "contributors", label: "Contributors", icon: Users },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border bg-secondary overflow-hidden">
            <img src={repo.owner.avatar_url} alt="" className="h-full w-full object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{repo.name}</h1>
              <a href={repo.html_url} target="_blank" rel="noopener noreferrer"><Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-secondary/80"><Code className="h-3 w-3" />{repo.owner.login}</Badge></a>
              {repo.license && <Badge variant="outline" className="gap-1"><Scale className="h-3 w-3" />{repo.license.spdx_id}</Badge>}
              {repo.archived && <Badge variant="destructive">Archived</Badge>}
            </div>
            <p className="text-muted-foreground mt-1">{repo.description}</p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(repo.created_at).toISOString().slice(0, 10)}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(repo.pushed_at).toISOString().slice(0, 10)}</span>
              <span>{new Intl.NumberFormat("en-US").format(repo.size)} KB</span>
            </div>
          </div>
        </div>

        {/* AI Summary */}
        {aiSummary && <Card className="mb-6 border-primary/20 bg-primary/5"><CardContent className="p-4"><div className="flex items-start gap-2"><Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" /><p className="text-sm text-muted-foreground">{aiSummary}</p></div></CardContent></Card>}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[{ label: "Stars", v: repo.stars || 0, i: Star, href: `${repo.html_url}/stargazers` }, { label: "Forks", v: repo.forks || 0, i: GitFork, href: `${repo.html_url}/forks` }, { label: "Watchers", v: (repo as any).watchers || (repo as any).watchers_count || 0, i: Eye, href: `${repo.html_url}/watchers` }, { label: "Issues", v: (repo as any).open_issues || (repo as any).open_issues_count || 0, i: Bug, href: `${repo.html_url}/issues` }].map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"><Card className="p-4 text-center hover:shadow-sm hover:border-primary/20 transition-all cursor-pointer"><s.i className="h-5 w-5 mx-auto mb-1 text-primary" /><p className="text-xl font-bold">{new Intl.NumberFormat("en-US").format(Number(s.v))}</p><p className="text-xs text-muted-foreground">{s.label}</p></Card></a>
          ))}
        </div>

        {/* Clone URLs + Tags */}
        {details && (
          <Card className="mb-6">
            <CardContent className="p-3">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-muted-foreground text-xs font-medium">Clone:</span>
                <code className="bg-secondary px-2 py-1 rounded text-xs flex items-center gap-2">
                  {(details as any).clone_urls?.https || ""}
                  <button onClick={() => { navigator.clipboard.writeText((details as any).clone_urls?.https || ""); setCopied(true); setTimeout(() => setCopied(false), 2000) }} className="text-primary hover:underline text-[10px]">
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </code>
                <code className="bg-secondary px-2 py-1 rounded text-xs">{(details as any).clone_urls?.ssh || ""}</code>
                {(details as any).tags?.length > 0 && (
                  <span className="flex items-center gap-1 ml-2">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    {(details as any).tags.map((t: any) => <Badge key={t.name} variant="outline" className="text-[10px]">{t.name}</Badge>)}
                  </span>
                )}
                {(details as any).features?.visibility && (
                  <Badge variant="secondary" className="text-[10px] ml-auto">{(details as any).features.visibility}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Language Bar */}
        {languages.length > 0 && (
          <Card className="mb-6 overflow-hidden">
            <div className="flex h-2">{languages.map((l) => (<div key={l.name} style={{ width: `${l.percentage}%`, backgroundColor: l.color }} className="first:rounded-l-full last:rounded-r-full" title={`${l.name}: ${l.percentage}%`} />))}</div>
            <CardContent className="p-3"><div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">{languages.map((l) => (<span key={l.name} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }} />{l.name} {l.percentage}%</span>))}</div></CardContent>
          </Card>
        )}

        {/* Search Bar */}
        <Card className="mb-4">
          <CardContent className="p-3">
            <form onSubmit={(e) => { e.preventDefault(); searchRepo() }} className="flex gap-2">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search this repository code..." className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              <button type="submit" className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Search</button>
            </form>
            {searchResults && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-muted-foreground">{(searchResults as any).total || 0} results</p>
                {((searchResults as any).items || []).slice(0, 5).map((r: any) => (
                  <a key={r.sha} href={r.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs hover:text-primary py-0.5"><Code className="h-3 w-3 shrink-0" /><span className="truncate">{r.path}</span></a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b overflow-x-auto scrollbar-hide">
          {tabs.map((t) => (<button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === t.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}><t.icon className="h-4 w-4" />{t.label}</button>))}
          <div className="flex-1" />
          <div className="flex gap-2">
            <a href={`${repo.html_url}/archive/refs/heads/${repo.default_branch}.zip`}><Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-secondary/80"><Download className="h-3 w-3" /> ZIP</Badge></a>
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer"><Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-secondary/80"><ExternalLink className="h-3 w-3" /> GitHub</Badge></a>
          </div>
        </div>

        {/* Tab: README */}
        {activeTab === "readme" && <Card><CardContent className="p-6"><Markdown content={readme} /></CardContent></Card>}

        {/* Tab: Files */}
        {activeTab === "files" && (
          <Card><CardContent className="p-0">
            {files.length === 0 ? (
              <div className="p-4 space-y-2">{Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-6 rounded" />)}</div>
            ) : (
              <div className="divide-y">{files.map((f) => (<div key={f.path} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent/50" style={{ paddingLeft: `${16 + (f.path.split("/").length - 1) * 20}px` }}>{f.type === "dir" ? <Folder className="h-4 w-4 text-amber-500 shrink-0" /> : <File className="h-4 w-4 text-muted-foreground shrink-0" />}<span className="truncate">{f.name}</span>{f.type === "file" && f.size > 0 && <span className="text-xs text-muted-foreground ml-auto">{f.size < 1024 ? `${f.size} B` : `${(f.size / 1024).toFixed(1)} KB`}</span>}</div>))}</div>
            )}
          </CardContent></Card>
        )}

        {/* Tab: Issues */}
        {activeTab === "issues" && (
          <Card><CardContent className="p-0">
            {!issues ? <div className="p-4 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}</div>
            : issues.open.length === 0 && issues.closed.length === 0 ? <p className="p-8 text-center text-muted-foreground">No issues.</p> : (
              <div className="divide-y">
                {issues.open.map((issue) => (<a key={issue.number} href={issue.html_url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 px-4 py-3 hover:bg-accent/50"><Bug className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" /><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{issue.title}</p><p className="text-xs text-muted-foreground">#{issue.number} · {new Date(issue.created_at).toISOString().slice(0, 10)}{issue.comments > 0 ? ` · ${issue.comments} comments` : ""}</p>{issue.labels.length > 0 && <div className="flex gap-1 mt-1">{issue.labels.map((l) => (<span key={l.name} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `#${l.color}30`, color: `#${l.color}` }}>{l.name}</span>))}</div>}</div></a>))}
                {issues.closed.slice(0, 3).map((issue) => (<a key={issue.number} href={issue.html_url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 px-4 py-3 hover:bg-accent/50 opacity-60"><Bug className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" /><div className="flex-1 min-w-0"><p className="text-sm truncate">{issue.title}</p><p className="text-xs text-muted-foreground">#{issue.number} · Closed</p></div></a>))}
              </div>
            )}
          </CardContent></Card>
        )}

        {/* Tab: Security */}
        {activeTab === "security" && (
          <Card><CardContent className="p-0">
            {!security ? <div className="p-4 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}</div> : (
              <div className="divide-y">
                {((security as any).advisories || []).length === 0 && ((security as any).code_scanning || []).length === 0 && ((security as any).dependabot || []).length === 0 ? (
                  <p className="p-8 text-center text-muted-foreground">No security alerts.</p>
                ) : (
                  <>
                    {(security as any).advisories?.map((a: any) => (<div key={a.ghsa_id} className="px-4 py-3"><div className="flex items-center gap-2"><Shield className={`h-4 w-4 ${a.severity === "critical" || a.severity === "high" ? "text-destructive" : "text-amber-500"}`} /><span className="text-sm font-medium flex-1">{a.summary}</span><span className="text-xs uppercase text-muted-foreground">{a.severity}</span></div></div>))}
                    {(security as any).code_scanning?.map((a: any, i: number) => (<div key={i} className="px-4 py-3 flex items-center gap-2"><Code className="h-4 w-4 text-amber-500" /><span className="text-sm flex-1">{a.rule}</span><span className="text-xs text-muted-foreground">{a.severity}</span></div>))}
                    {(security as any).dependabot?.map((a: any, i: number) => (<div key={i} className="px-4 py-3"><div className="flex items-center gap-2"><Shield className="h-4 w-4 text-amber-500" /><span className="text-sm flex-1">{a.package_name}: {a.summary}</span><span className="text-xs text-muted-foreground">{a.severity}</span></div></div>))}
                  </>
                )}
              </div>
            )}
          </CardContent></Card>
        )}

        {/* Tab: Pull Requests */}
        {activeTab === "pulls" && (
          <Card><CardContent className="p-0">
            {!pullRequests ? <div className="p-4 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded" />)}</div> : (
              <div className="divide-y">
                {((pullRequests as any).draft || []).map((pr: any) => (<a key={pr.number} href={pr.html_url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 px-4 py-3 hover:bg-accent/50 opacity-70"><GitCommit className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" /><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{pr.title}</p><p className="text-xs text-muted-foreground">#{pr.number} · Draft · {pr.head?.ref} → {pr.base?.ref}</p></div><code className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">Draft</code></a>))}
                {((pullRequests as any).open || []).map((pr: any) => (<a key={pr.number} href={pr.html_url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 px-4 py-3 hover:bg-accent/50"><GitCommit className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" /><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{pr.title}</p><p className="text-xs text-muted-foreground">#{pr.number} · {pr.head?.ref} → {pr.base?.ref} · {pr.comments} comments</p>{pr.labels?.length > 0 && <div className="flex gap-1 mt-1">{pr.labels.map((l: any) => (<span key={l.name} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `#${l.color}30`, color: `#${l.color}` }}>{l.name}</span>))}</div>}</div><div className="text-xs text-muted-foreground shrink-0 text-right">{pr.comments > 0 && <span>{pr.comments} 💬</span>}</div></a>))}
                {((pullRequests as any).closed || []).slice(0, 3).map((pr: any) => (<a key={pr.number} href={pr.html_url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 px-4 py-3 hover:bg-accent/50 opacity-60"><GitCommit className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" /><div className="flex-1 min-w-0"><p className="text-sm truncate">{pr.title}</p><p className="text-xs text-muted-foreground">#{pr.number} · {pr.merged ? "Merged" : "Closed"}</p></div></a>))}
              </div>
            )}
          </CardContent></Card>
        )}

        {/* Tab: Commits */}
        {activeTab === "commits" && (
          <Card><CardContent className="p-0">
            {commits.length === 0 ? <p className="p-8 text-center text-muted-foreground">No commits.</p> : (
              <div className="divide-y">{commits.map((c) => (<a key={c.sha} href={c.html_url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 px-4 py-3 hover:bg-accent/50"><GitCommit className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" /><div className="flex-1 min-w-0"><p className="text-sm truncate">{c.message}</p><p className="text-xs text-muted-foreground">{c.author?.name || "Unknown"} · {c.date ? new Date(c.date).toISOString().slice(0, 10) : ""} · <span className="font-mono">{c.sha}</span></p></div></a>))}</div>
            )}
          </CardContent></Card>
        )}

        {/* Tab: Community */}
        {activeTab === "community" && (
          <div className="space-y-4">
            {!about ? <Card><CardContent className="p-6"><Skeleton className="h-40" /></CardContent></Card> : (
              <>
                {/* Community Health */}
                {about.features && (
                  <Card><CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Features</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(Object.entries(about.features) as [string, unknown][]).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-2 text-sm">
                          {val ? <Shield className="h-4 w-4 text-emerald-500" /> : <Shield className="h-4 w-4 text-muted-foreground/50" />}
                          <span className="capitalize">{key.replace(/_/g, " ")}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent></Card>
                )}

                {/* Docs & Files */}
                {about.categorized?.map((section) => (
                  <Card key={section.category}><CardContent className="p-4">
                    <h3 className="font-semibold mb-3">{section.category}</h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {section.files.map((f) => (
                        <a key={f.path} href={f.download_url || `${repo.html_url}/blob/main/${f.path}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent/50 transition-colors">
                          <File className="h-4 w-4 text-primary shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{f.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{f.path}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </CardContent></Card>
                ))}

                {/* Badges */}
                {about.badges?.length > 0 && (
                  <Card><CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Badges</h3>
                    <div className="flex flex-wrap gap-2">
                      {about.badges.map((b) => (
                        <img key={b.label} src={b.url} alt={b.label} className="h-5" />
                      ))}
                    </div>
                  </CardContent></Card>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab: Milestones */}
        {activeTab === "milestones" && (
          <Card><CardContent className="p-0">
            {!milestones ? <div className="p-4 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}</div> : (
              <div className="divide-y">
                {((milestones as any).milestones || []).length === 0 ? <p className="p-8 text-center text-muted-foreground">No milestones.</p> :
                ((milestones as any).milestones || []).map((m: any) => (
                  <a key={m.title} href={m.html_url} target="_blank" rel="noopener noreferrer" className="px-4 py-3 block hover:bg-accent/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{m.title}</span>
                      <span className="text-xs text-muted-foreground">{Math.round(m.progress)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(m.progress, 100)}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{m.open_issues} open · {m.closed_issues} closed{m.due_on ? ` · Due ${new Date(m.due_on).toISOString().slice(0, 10)}` : ""}</p>
                  </a>
                ))}
                {((milestones as any).protected_branches || []).length > 0 && (
                  <div className="px-4 py-3 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Protected Branches</p>
                    <div className="flex flex-wrap gap-1">{((milestones as any).protected_branches || []).map((b: any) => (<span key={b.name} className="text-xs bg-secondary px-2 py-0.5 rounded">{b.name}</span>))}</div>
                  </div>
                )}
                {((milestones as any).environments || []).length > 0 && (
                  <div className="px-4 py-3 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Environments</p>
                    <div className="flex flex-wrap gap-1">{((milestones as any).environments || []).map((e: any) => (<span key={e.name} className="text-xs bg-secondary px-2 py-0.5 rounded">{e.name}</span>))}</div>
                  </div>
                )}
              </div>
            )}
          </CardContent></Card>
        )}

        {/* Tab: DevOps */}
        {activeTab === "devops" && (
          <div className="space-y-4">
            {!about ? <Card><CardContent className="p-6"><Skeleton className="h-40" /></CardContent></Card> : (
              <>
                {/* CI/CD Workflows */}
                {about.workflows?.length > 0 && (
                  <Card><CardContent className="p-4">
                    <h3 className="font-semibold mb-3">CI/CD Workflows</h3>
                    <div className="space-y-2">
                      {about.workflows.map((w) => (
                        <div key={w.name} className="flex items-center gap-3 rounded-lg border p-3">
                          <Activity className={`h-4 w-4 ${w.state === "active" ? "text-emerald-500" : "text-muted-foreground"}`} />
                          <span className="text-sm font-medium flex-1">{w.name}</span>
                          <Badge variant={w.state === "active" ? "success" : "secondary"}>{w.state}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent></Card>
                )}

                {/* Infrastructure */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Infrastructure</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border p-3 text-sm">Docker</div>
                      <div className="rounded-lg border p-3 text-sm">CI/CD</div>
                      <div className="rounded-lg border p-3 text-sm">Deployment</div>
                      <div className="rounded-lg border p-3 text-sm">Monitoring</div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Tab: Insights */}
        {activeTab === "insights" && (
          <div className="space-y-4">
            {!traffic ? <Card><CardContent className="p-6"><Skeleton className="h-40" /></CardContent></Card> : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Card className="p-4 text-center"><Eye className="h-5 w-5 mx-auto mb-1 text-primary" /><p className="text-xl font-bold">{new Intl.NumberFormat("en-US").format((traffic as any)?.views?.total || 0)}</p><p className="text-xs text-muted-foreground">Total Views</p></Card>
                  <Card className="p-4 text-center"><Eye className="h-5 w-5 mx-auto mb-1 text-primary" /><p className="text-xl font-bold">{new Intl.NumberFormat("en-US").format((traffic as any)?.views?.unique || 0)}</p><p className="text-xs text-muted-foreground">Unique Visitors</p></Card>
                  <Card className="p-4 text-center"><Download className="h-5 w-5 mx-auto mb-1 text-primary" /><p className="text-xl font-bold">{new Intl.NumberFormat("en-US").format((traffic as any)?.clones?.total || 0)}</p><p className="text-xs text-muted-foreground">Total Clones</p></Card>
                  <Card className="p-4 text-center"><GitFork className="h-5 w-5 mx-auto mb-1 text-primary" /><p className="text-xl font-bold">{((traffic as any)?.forks?.length) || 0}</p><p className="text-xs text-muted-foreground">Recent Forks</p></Card>
                </div>

                {((traffic as any).dependents_count as number) > 0 && (
                  <Card><CardContent className="p-4"><div className="flex items-center gap-2"><Box className="h-4 w-4 text-primary" /><span className="text-sm font-medium">{(traffic as any).dependents_count} dependents</span></div></CardContent></Card>
                )}

                {(traffic as any).forks?.length > 0 && (
                  <Card><CardContent className="p-4"><h3 className="font-semibold mb-3">Recent Forks</h3><div className="space-y-2">                      {(traffic as any).forks?.map((f: any, i: number) => (<a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-primary"><img src={f.avatar} alt="" className="h-6 w-6 rounded-full" />{f.owner}{f.stars > 0 ? ` · ${f.stars} stars` : ""}</a>))}</div></CardContent></Card>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab: Releases */}
        {activeTab === "releases" && (
          <div className="space-y-3">{releases.length === 0 ? <Card><CardContent className="p-8 text-center text-muted-foreground">No releases.</CardContent></Card> : releases.map((r) => (<Card key={r.tag_name}><CardContent className="p-4"><div className="flex items-start justify-between mb-2"><div><a href={r.html_url} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-primary">{r.name || r.tag_name}</a><p className="text-xs text-muted-foreground">{new Date(r.published_at).toISOString().slice(0, 10)}</p></div>{r.prerelease && <Badge variant="warning">Pre-release</Badge>}</div>{r.body && <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">{r.body}</p>}</CardContent></Card>))}</div>
        )}

        {/* Tab: Contributors */}
        {activeTab === "contributors" && (
          <Card><CardContent className="p-0">{contributors.length === 0 ? <p className="p-8 text-center text-muted-foreground">No data.</p> : <div className="divide-y">{contributors.map((c, i) => (<div key={c.login} className="flex items-center gap-3 px-4 py-3"><span className="text-xs text-muted-foreground w-5">{i + 1}</span><img src={c.avatar_url} alt="" className="h-8 w-8 rounded-full" /><span className="font-medium flex-1">{c.login}</span><span className="text-sm text-muted-foreground">{c.contributions} commits</span></div>))}</div>}</CardContent></Card>
        )}

        {/* Topics */}
        {repo.topics.length > 0 && (<div className="mt-6"><p className="text-sm font-medium text-muted-foreground mb-2">Topics</p><div className="flex flex-wrap gap-1.5">{repo.topics.slice(0, 20).map((t) => <span key={t} className="inline-flex items-center rounded-full border bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground"> {t}</span>)}</div></div>)}
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { Sparkles, ArrowRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const questions = [
  { key: "task", question: "What do you need AI for?", options: [
    { value: "chat", label: "Chat & Conversations" },
    { value: "coding", label: "Coding & Development" },
    { value: "image", label: "Image Generation" },
    { value: "video", label: "Video Creation" },
    { value: "writing", label: "Writing & Content" },
    { value: "marketing", label: "Marketing & SEO" },
    { value: "productivity", label: "Productivity" },
    { value: "business", label: "Business & Analytics" },
    { value: "education", label: "Education & Learning" },
    { value: "automation", label: "Automation" },
  ]},
  { key: "budget", question: "What's your budget?", options: [
    { value: "free", label: "Free only" },
    { value: "freemium", label: "Free with paid upgrades" },
    { value: "paid", label: "Paid (best quality)" },
    { value: "any", label: "No preference" },
  ]},
  { key: "experience", question: "Your experience level?", options: [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "expert", label: "Expert" },
  ]},
]

interface ToolResult {
  id: string; name: string; slug: string; tagline: string; pricing: string
  websiteUrl: string; viewCount: number; matchReason: string
  categories: { category: { name: string } }[]
  reviews: { rating: number }[]
}

export default function RecommendPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [results, setResults] = useState<ToolResult[]>([])
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)

  function selectAnswer(key: string, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }))
    if (step < questions.length - 1) {
      setStep(step + 1)
    }
  }

  async function getRecommendations() {
    setLoading(true)
    try {
      const task = answers.task || ""
      const budget = answers.budget || "any"
      const params = new URLSearchParams()
      if (task) params.set("category", task)
      if (budget === "free") params.set("pricing", "FREE")
      else if (budget === "freemium") params.set("pricing", "FREEMIUM")
      params.set("sort", "popular")
      params.set("limit", "6")

      const res = await fetch(`/api/tools?${params}`)
      const data = await res.json()
      const items: ToolResult[] = (data.items || []).map((t: Record<string, unknown>) => ({
        id: String(t.id || ""),
        name: String(t.name || ""),
        slug: String(t.slug || ""),
        tagline: String(t.tagline || ""),
        pricing: String(t.pricing || "FREE"),
        websiteUrl: String(t.websiteUrl || ""),
        viewCount: Number(t.viewCount || 0),
        matchReason: getMatchReason(task),
        categories: [],
        reviews: [],
      }))
      setResults(items)
    } catch (error) {
      console.error("[RECOMMEND] Failed to get recommendations", error)
    }
    setLoading(false)
  }

  function getMatchReason(task: string): string {
    const reasons: Record<string, string> = {
      chat: "Excels at natural conversations and Q&A",
      coding: "Top choice for developers with excellent code generation",
      image: "Best-in-class image generation with stunning outputs",
      video: "Leading video AI for professional content creation",
      writing: "Powerful writing assistant for content creation",
      marketing: "Built for marketers with SEO-optimized content",
      productivity: "Boosts productivity and streamlines workflows",
      business: "Enterprise-ready for business analytics",
      education: "Perfect for learning and education",
      automation: "Automates workflows and saves time",
    }
    return reasons[task] || "Highly rated and popular"
  }

  if (!started) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="max-w-xl mx-auto px-4 text-center">
          <Sparkles className="h-12 w-12 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold tracking-tight mb-4">Find Your Perfect AI Tool</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Answer a few questions and we&apos;ll recommend the best AI tools for your needs.
          </p>
          <Button size="lg" onClick={() => setStarted(true)}>
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  if (results.length > 0) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
            <h2 className="text-2xl font-bold">Your AI Recommendations</h2>
            <p className="text-muted-foreground mt-2">Based on your preferences</p>
            <Button variant="outline" size="sm" onClick={() => { setResults([]); setStep(0); setAnswers({}) }} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" /> Start Over
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((tool) => (
              <Link key={tool.id} href={`/ai-tool/${tool.slug}`}>
                <Card className="p-5 h-full hover:border-primary/30 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-base font-bold text-primary">{tool.name.charAt(0)}</div>
                    <div>
                      <p className="font-semibold">{tool.name}</p>
                      <Badge variant={tool.pricing === "FREE" ? "success" : "default"} className="text-[10px]">{tool.pricing}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{tool.tagline}</p>
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <Sparkles className="h-3 w-3" />
                    <span>{tool.matchReason}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center"><Skeleton className="h-8 w-48 mx-auto mb-4" /><Skeleton className="h-4 w-64 mx-auto" /></div>
      </div>
    )
  }

  const question = questions[step]
  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <div className="max-w-lg mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-1 mb-8">
          {questions.map((_, i) => (
            <div key={i} className={`h-1.5 w-12 rounded-full ${i <= step ? "bg-primary" : "bg-secondary"}`} />
          ))}
        </div>
        <h2 className="text-2xl font-bold mb-2">{question.question}</h2>
        <p className="text-sm text-muted-foreground mb-8">Select one option</p>
        <div className="grid gap-3">
          {question.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                selectAnswer(question.key, opt.value)
                if (step === questions.length - 1) {
                  setTimeout(getRecommendations, 100)
                }
              }}
              className="flex items-center justify-between rounded-xl border p-4 text-left hover:border-primary/50 hover:bg-accent transition-all"
            >
              <span className="font-medium">{opt.label}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

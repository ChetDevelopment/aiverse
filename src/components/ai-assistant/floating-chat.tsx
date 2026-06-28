"use client"

import { useState, useRef, useEffect } from "react"
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  RefreshCw,
  Layout,
  FileText,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface PageContext {
  page?: string
  category?: string
  searchQuery?: string
  toolSlug?: string
  savedCount?: number
  compareCount?: number
}

interface UserInfo {
  id: string
  name?: string
  email?: string
}

interface SuggestedAction {
  label: string
  icon: React.ReactNode
  query: string
}

const quickResponses: Record<string, string> = {
  chat: "For chat & conversations, I recommend **ChatGPT** (best all-around) or **Claude** (great for analysis). Both have free tiers!",
  coding:
    "For coding, try **GitHub Copilot** (best IDE integration) or **Cursor** (AI-first editor). **Claude** is also excellent for code generation.",
  image:
    "For image generation, **Midjourney** has the best quality. **DALL-E 3** (in ChatGPT Plus) is great too. For free options, try **Stable Diffusion**.",
  video:
    "For video, check out **RunwayML** (editing + generation) or **Synthesia** (AI avatars). **CapCut** has great free AI features.",
  writing:
    "For writing, **Jasper** is best for marketing copy. **Claude** excels at long-form content. **Grammarly** is great for editing.",
  free: "Looking for free AI tools? **ChatGPT** (free tier), **Claude** (free tier), **Canva AI**, and **Perplexity AI** are excellent options!",
}

function getPageContext(): PageContext {
  const path = window.location.pathname
  const searchParams = new URLSearchParams(window.location.search)
  const context: PageContext = {}

  const toolMatch = path.match(/^\/ai-tool\/(.+)$/)
  if (toolMatch) {
    context.toolSlug = toolMatch[1]
    context.page = "tool"
  }

  const categoryMatch = path.match(/^\/categories\/(.+)$/)
  if (categoryMatch) {
    context.category = categoryMatch[1]
    context.page = "category"
  }

  const searchQuery = searchParams.get("q")
  if (path === "/search" && searchQuery) {
    context.searchQuery = searchQuery
    context.page = "search"
  }

  try {
    const saved = localStorage.getItem("aiverse-saved")
    if (saved) {
    const parsed = JSON.parse(saved)
      context.savedCount = Array.isArray(parsed) ? parsed.length : 0
    }
    const compare = localStorage.getItem("aiverse-compare")
    if (compare) {
    const parsed = JSON.parse(compare)
      context.compareCount = Array.isArray(parsed) ? parsed.length : 0
    }
  } catch {}

  return context
}

function getSuggestedQuestions(context: PageContext): string[] {
  if (context.toolSlug) {
    return [
      `What are the best alternatives to ${context.toolSlug}?`,
      "How does this tool compare to others?",
      "What are the key features of this tool?",
    ]
  }
  if (context.category) {
    return [
      `What are the best tools in ${context.category}?`,
      `Which ${context.category} tools are free?`,
      `How do I choose a tool in ${context.category}?`,
    ]
  }
  if (context.searchQuery) {
    return [
      `What are the best tools for ${context.searchQuery}?`,
      "Can you help me refine my search?",
      "What features should I look for?",
    ]
  }
  return [
    "What are the best free AI tools?",
    "Best AI tools for coding?",
    "Best AI tools for image generation?",
    "Compare ChatGPT vs Claude",
  ]
}

function buildWelcome(
  user: UserInfo | null,
  context: PageContext
): string {
  if (user?.name) {
    return `Welcome back, ${user.name}! I'm your AI assistant. I can help you discover tools, find prompts, and learn about AI. What are you working on today?`
  }
  if (context.toolSlug) {
    return `Hi! I'm your AI assistant. Ask me anything about **${context.toolSlug}** or other AI tools!`
  }
  return "Hi! I'm your AI assistant. I can help you discover tools, find prompts, and learn about AI. What are you working on today?"
}

function buildPersonalizedActions(
  user: UserInfo | null,
  context: PageContext
): SuggestedAction[] {
  const actions: SuggestedAction[] = []
  if (user) {
    actions.push({
      label: "Explore new tools",
      icon: <Sparkles className="h-3 w-3" />,
      query: "What AI tools should I try?",
    })
    actions.push({
      label: "Try a new prompt",
      icon: <FileText className="h-3 w-3" />,
      query: "Show me some popular prompts",
    })
    actions.push({
      label: "View your stacks",
      icon: <Layers className="h-3 w-3" />,
      query: "What tool stacks do you recommend?",
    })
  }
  if (context.toolSlug) {
    actions.push({
      label: "Continue learning",
      icon: <Layout className="h-3 w-3" />,
      query: `Tell me more about ${context.toolSlug}`,
    })
  }
  return actions.slice(0, 4)
}

export function FloatingChat() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [messages, setMessages] = useState<
    { role: "bot" | "user"; text: string }[]
  >(() => {
    if (typeof window !== "undefined") {
      return [{ role: "bot", text: buildWelcome(null, getPageContext()) }]
    }
    return []
  })
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [pageContext, setPageContext] = useState<PageContext>({})
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ctx = getPageContext()

      fetch("/api/auth/user")
        .then((r) => r.json())
        .then((data) => {
          setPageContext(ctx)
          if (data.user) setUser(data.user)
        })
        .catch(() => {
          setPageContext(ctx)
        })
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend(message?: string) {
    const msg = message || input.trim()
    if (!msg) return
    setMessages((prev) => [...prev, { role: "user", text: msg }])
    setInput("")
    setIsTyping(true)
    setError(null)

    const lower = msg.toLowerCase()
    const match = Object.keys(quickResponses).find((k) => lower.includes(k))
    if (match) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: quickResponses[match] },
        ])
        setIsTyping(false)
      }, 600)
      return
    }

    try {
      const body: Record<string, unknown> = {
        message: msg,
        history: messages
          .slice(-6)
          .map((m) => ({
            role: m.role === "bot" ? "assistant" : "user",
            content: m.text,
          })),
        context: pageContext,
      }
      if (user?.id) {
        body.userId = user.id
      }

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`)
      }

      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: data.reply || "Sorry, I couldn't process that.",
        },
      ])
    } catch {
      setError("Failed to get response. Check your connection.")
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "I'm having trouble connecting. Please try again or ask about **chat**, **coding**, **image generation**, **video**, **writing**, or **free tools**!",
        },
      ])
    }
    setIsTyping(false)
  }

  const suggestedQuestions = getSuggestedQuestions(pageContext)
  const personalizedActions = buildPersonalizedActions(user, pageContext)

  return (
    <>
      <Button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
        size="icon"
        aria-label="AI Assistant"
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </Button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl border bg-background shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 bg-primary p-4 text-primary-foreground">
            <Bot className="h-5 w-5" />
            <span className="text-sm font-semibold">
              {user?.name ? `${user.name}'s Assistant` : "AI Assistant"}
            </span>
            {(pageContext.toolSlug ||
              pageContext.category ||
              pageContext.searchQuery) && (
              <span className="ml-auto max-w-[120px] truncate text-[10px] opacity-75">
                {pageContext.toolSlug && `📍 ${pageContext.toolSlug}`}
                {pageContext.category &&
                  !pageContext.toolSlug &&
                  `📍 ${pageContext.category}`}
                {pageContext.searchQuery &&
                  !pageContext.toolSlug &&
                  !pageContext.category &&
                  `📍 "${pageContext.searchQuery}"`}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 p-4 max-h-80 scrollbar-hide">
            {personalizedActions.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {personalizedActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(action.query)}
                    className="inline-flex items-center gap-1 rounded-full border bg-secondary/50 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {messages.length === 1 && suggestedQuestions.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="rounded-full border bg-secondary/50 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "bot" && <Bot className="h-6 w-6 mt-1 shrink-0 text-primary" />}
                <div className={cn(
                  "rounded-xl px-3 py-2 max-w-[80%] text-sm leading-relaxed",
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"
                )}>
                  {msg.text.split("**").map((part, j) => j % 2 === 0 ? part : <strong key={j}>{part}</strong>)}
                </div>
                {msg.role === "user" && <User className="h-6 w-6 mt-1 shrink-0 text-muted-foreground" />}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2">
                <Bot className="h-6 w-6 mt-1 shrink-0 text-primary" />
                <div className="rounded-xl bg-secondary px-3 py-2 text-sm">
                  <span className="animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-xs text-destructive px-1">
                <RefreshCw className="h-3 w-3" />
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="flex items-center gap-2 border-t p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Best AI for image gen..."
              className="h-9 text-sm"
            />
            <Button type="submit" size="icon" className="h-9 w-9 shrink-0 rounded-full" disabled={isTyping} aria-label="Send message">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  )
}

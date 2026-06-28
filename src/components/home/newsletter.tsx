"use client"

import * as React from "react"
import { Mail, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { newsletterSchema } from "@/lib/validations"
import { cn } from "@/lib/utils"

export function Newsletter() {
  const [email, setEmail] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = React.useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = newsletterSchema.safeParse({ email })
    if (!result.success) {
      setStatus("error")
      setMessage(result.error.issues[0].message)
      return
    }

    setStatus("loading")
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error("Failed to subscribe")
      setStatus("success")
      setMessage("You're subscribed! Check your inbox.")
      setEmail("")
    } catch {
      setStatus("error")
      setMessage("Something went wrong. Please try again.")
    }
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-background p-8 sm:p-12 text-center"
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          </div>

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
            <Mail className="h-6 w-6 text-primary" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Stay Ahead of AI
          </h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">
            Get the latest AI tools, news, and insights delivered to your inbox
            every week.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 mx-auto max-w-md flex flex-col sm:flex-row gap-3"
          >
            <div className="flex-1 relative">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "h-11",
                  status === "error" && "border-destructive"
                )}
                disabled={status === "loading"}
              />
            </div>
            <Button
              type="submit"
              disabled={status === "loading"}
              className="h-11"
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          {message && (
            <p
              className={cn(
                "mt-4 text-sm",
                status === "success" && "text-emerald-600 dark:text-emerald-400",
                status === "error" && "text-destructive"
              )}
            >
              {message}
            </p>
          )}

          <p className="mt-4 text-xs text-muted-foreground">
            No spam. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Sparkles, Search } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Hero() {
  const [query, setQuery] = React.useState("")

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border bg-secondary px-4 py-1.5 text-sm text-muted-foreground mb-8">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Your complete AI productivity ecosystem</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
          >
            Discover the{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Best AI Tools
            </span>{" "}
            for Every Task
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Find, compare, and learn about thousands of AI tools. From writing
            to coding, image generation to video — we help you choose the right
            AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 mx-auto max-w-xl"
          >
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault()
                if (query.trim()) {
                  window.location.href = `/search?q=${encodeURIComponent(query.trim())}`
                }
              }}
              className="relative"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search AI tools..."
                aria-label="Search AI tools"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-14 pl-12 pr-36 rounded-2xl border-2 text-base shadow-lg shadow-primary/5"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 rounded-xl"
              >
                Search
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground"
          >
            <span className="font-medium text-foreground">Popular:</span>
            {["ChatGPT", "Midjourney", "Claude", "GitHub Copilot", "Canva"].map(
              (tool) => (
                <Link
                  key={tool}
                  href={`/search?q=${encodeURIComponent(tool)}`}
                  className="rounded-full border bg-secondary px-3 py-1 hover:bg-accent transition-colors"
                >
                  {tool}
                </Link>
              )
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

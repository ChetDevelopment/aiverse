"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

export function PwaBackButton() {
  const router = useRouter()
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsStandalone(true)
    }
    const handler = (e: MediaQueryListEvent) => setIsStandalone(e.matches)
    const mq = window.matchMedia("(display-mode: standalone)")
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  if (!isStandalone) return null

  return (
    <button
      onClick={() => router.back()}
      className={cn(
        "fixed top-4 left-4 z-[200] flex items-center gap-1.5",
        "h-8 rounded-lg border bg-background/80 px-2.5 text-xs font-medium",
        "backdrop-blur shadow-sm hover:bg-accent transition-colors",
      )}
      aria-label="Go back"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Back
    </button>
  )
}

"use client"

import { Link2, Check, Share2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false)
  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url

  function copyLink() {
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: fullUrl })
      } catch {}
    } else {
      copyLink()
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleShare}>
        <Share2 className="mr-2 h-4 w-4" /> Share
      </Button>
      <Button variant="outline" size="sm" onClick={copyLink}>
        {copied ? <Check className="mr-2 h-4 w-4" /> : <Link2 className="mr-2 h-4 w-4" />}
        {copied ? "Copied!" : "Copy"}
      </Button>
    </div>
  )
}

"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

const TradingContent = dynamic(() => import("./trading-content"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen pt-24">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
})

export default function TradingPage() {
  return <TradingContent />
}

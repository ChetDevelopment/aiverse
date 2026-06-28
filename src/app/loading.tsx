import { Sparkles } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Sparkles className="h-8 w-8 text-primary animate-pulse" />
      <p className="mt-4 text-sm text-muted-foreground animate-pulse">Loading...</p>
    </div>
  )
}

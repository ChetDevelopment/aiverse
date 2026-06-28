import { cn } from "@/lib/utils"

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border p-5", className)}>
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-muted to-muted/50 animate-pulse" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-3/4 rounded-lg bg-gradient-to-r from-muted via-muted/70 to-muted animate-pulse" />
          <div className="h-3 w-full rounded-lg bg-gradient-to-r from-muted via-muted/70 to-muted animate-pulse" />
          <div className="h-3 w-2/3 rounded-lg bg-gradient-to-r from-muted via-muted/70 to-muted animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonToolGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonCategoryGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border p-5">
          <div className="mx-auto h-6 w-6 rounded-lg bg-gradient-to-br from-muted to-muted/50 animate-pulse" />
          <div className="mx-auto mt-2 h-3 w-16 rounded bg-gradient-to-r from-muted via-muted/70 to-muted animate-pulse" />
          <div className="mx-auto mt-1 h-2 w-12 rounded bg-gradient-to-r from-muted via-muted/70 to-muted animate-pulse" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonDetail() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-start gap-5">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-muted to-muted/50 animate-pulse" />
              <div className="flex-1 space-y-3">
                <div className="h-7 w-64 rounded-lg bg-gradient-to-r from-muted via-muted/70 to-muted animate-pulse" />
                <div className="h-4 w-96 rounded-lg bg-gradient-to-r from-muted via-muted/70 to-muted animate-pulse" />
              </div>
            </div>
            <div className="h-48 rounded-xl bg-gradient-to-br from-muted/50 via-muted to-muted/50 animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-gradient-to-r from-muted via-muted/70 to-muted animate-pulse" />
              <div className="h-3 w-5/6 rounded bg-gradient-to-r from-muted via-muted/70 to-muted animate-pulse" />
              <div className="h-3 w-4/6 rounded bg-gradient-to-r from-muted via-muted/70 to-muted animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 rounded-xl bg-gradient-to-br from-muted/50 via-muted to-muted/50 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border divide-y">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <div className="h-4 flex-1 rounded bg-gradient-to-r from-muted via-muted/70 to-muted animate-pulse" />
          <div className="h-4 w-20 rounded bg-gradient-to-r from-muted via-muted/70 to-muted animate-pulse" />
          <div className="h-4 w-16 rounded bg-gradient-to-r from-muted via-muted/70 to-muted animate-pulse" />
        </div>
      ))}
    </div>
  )
}

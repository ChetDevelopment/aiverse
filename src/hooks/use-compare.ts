"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"

const MAX_COMPARE = 3

export function useCompare() {
  const [slugs, setSlugs] = useState<string[]>([])
  const router = useRouter()

  const addToCompare = useCallback((slug: string) => {
    setSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug)
      if (prev.length >= MAX_COMPARE) return prev
      return [...prev, slug]
    })
  }, [])

  const removeFromCompare = useCallback((slug: string) => {
    setSlugs((prev) => prev.filter((s) => s !== slug))
  }, [])

  const isInCompare = useCallback(
    (slug: string) => slugs.includes(slug),
    [slugs]
  )

  const clearCompare = useCallback(() => setSlugs([]), [])

  const goToCompare = useCallback(() => {
    if (slugs.length >= 2) {
      router.push(`/compare?tools=${slugs.join(",")}`)
    }
  }, [slugs, router])

  return {
    slugs,
    addToCompare,
    removeFromCompare,
    isInCompare,
    clearCompare,
    goToCompare,
    count: slugs.length,
    canCompare: slugs.length >= 2,
  }
}

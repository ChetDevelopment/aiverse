"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Eye } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { StarRating } from "@/components/shared/star-rating"
import type { ToolCardData } from "@/types"

const pricingColors = {
  FREE: "success",
  FREEMIUM: "warning",
  PAID: "default",
  CONTACT: "secondary",
} as const

export const ToolCard = React.memo(function ToolCard({ tool, index = 0 }: { tool: ToolCardData & { fromGitHub?: boolean; stars?: number; forks?: number; language?: string }; index?: number }) {
  const avgRating =
    tool.reviews.length > 0
      ? tool.reviews.reduce((acc, r) => acc + r.rating, 0) / tool.reviews.length
      : 0

  const isGH = (tool as any).fromGitHub
  const ghName = isGH ? ((tool as any).fullName || tool.slug) : ""
  const href = isGH ? `/repo/${encodeURIComponent(ghName)}` : `/ai-tool/${tool.slug}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={href}>
        <Card className="group relative h-full p-5 hover:shadow-md hover:border-primary/20 transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-secondary text-lg font-bold text-primary overflow-hidden">
              {tool.logo ? (
                <Image src={tool.logo} alt={tool.name} width={48} height={48} className="h-full w-full object-contain p-1" />
              ) : (
                tool.name.charAt(0)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                    {tool.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                    {tool.tagline}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant={pricingColors[tool.pricing]} className="text-[10px]">
                  {tool.pricing === "FREE"
                    ? "Free"
                    : tool.pricing === "FREEMIUM"
                      ? "Freemium"
                      : tool.pricing === "PAID"
                        ? "Paid"
                        : "Contact"}
                </Badge>
                {tool.isOpenSource && (
                  <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                    Open Source
                  </Badge>
                )}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <StarRating rating={avgRating} />
                  {avgRating > 0 && (
                    <span className="font-medium">{avgRating.toFixed(1)}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  {tool.viewCount}
                </div>
              </div>
              {tool.categories.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {tool.categories.slice(0, 2).map((tc) => (
                    <span
                      key={tc.category.slug}
                      className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md"
                    >
                      {tc.category.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
})

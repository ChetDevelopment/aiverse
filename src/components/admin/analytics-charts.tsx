"use client"

import { motion } from "framer-motion"
import { TrendingUp, Users, Eye, Star } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  change?: string
  icon: typeof TrendingUp
  color: string
}

function StatCard({ label, value, change, icon: Icon, color }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-card p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {change && (
            <p className="text-xs text-emerald-500 mt-1">+{change} this week</p>
          )}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </motion.div>
  )
}

interface TopTool {
  name: string
  slug: string
  value: number
  secondary: string
}

function TopToolRow({ tool, max, index }: { tool: TopTool; max: number; index: number }) {
  const pct = max > 0 ? (tool.value / max) * 100 : 0
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 py-2"
    >
      <span className="w-5 text-xs text-muted-foreground">{index + 1}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{tool.name}</p>
        <div className="h-2 rounded-full bg-secondary mt-1 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, delay: index * 0.05 }}
            className="h-full rounded-full bg-primary"
          />
        </div>
      </div>
      <span className="text-sm text-muted-foreground">{tool.value.toLocaleString()}</span>
      <span className="text-xs text-muted-foreground">{tool.secondary}</span>
    </motion.div>
  )
}

export function StatsGrid({ data }: { data: { tools: number; users: number; views: number; favorites: number; reviews: number } }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <StatCard label="Total Tools" value={data.tools} change="this week" icon={Star} color="bg-blue-500" />
      <StatCard label="Total Users" value={data.users} icon={Users} color="bg-emerald-500" />
      <StatCard label="Total Views" value={data.views.toLocaleString()} icon={Eye} color="bg-violet-500" />
      <StatCard label="Favorites" value={data.favorites} icon={TrendingUp} color="bg-rose-500" />
      <StatCard label="Reviews" value={data.reviews} icon={Star} color="bg-amber-500" />
    </div>
  )
}

export function TopToolsChart({ tools }: { tools: TopTool[] }) {
  const max = Math.max(...tools.map((t) => t.value), 1)

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="font-semibold mb-4">Top Performing Tools</h3>
      <div className="space-y-1">
        {tools.map((tool, i) => (
          <TopToolRow key={tool.slug} tool={tool} max={max} index={i} />
        ))}
      </div>
    </div>
  )
}

export function WeeklyTrend({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="font-semibold mb-4">Weekly Views</h3>
      <div className="flex items-end gap-2 h-32">
        {data.map((d, i) => (
          <motion.div
            key={d.label}
            initial={{ height: 0 }}
            animate={{ height: `${(d.value / max) * 100}%` }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="flex-1 rounded-t-md bg-primary/60 hover:bg-primary transition-colors relative group"
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 whitespace-nowrap">
              {d.value}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        {data.map((d) => (
          <div key={d.label} className="flex-1 text-center text-[10px] text-muted-foreground">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  )
}

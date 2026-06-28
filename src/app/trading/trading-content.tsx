"use client"

import { useState, useEffect } from "react"
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  CandlestickChart,
  Newspaper,
  MessageCircle,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  Activity,
  Heart,
} from "lucide-react"
import { TradingChart } from "@/components/trading/trading-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"

interface Asset {
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  logo: string
}

interface Analysis {
  symbol: string
  signal: "BUY" | "SELL" | "NEUTRAL"
  confidence: number
  summary: string
  indicators: { name: string; value: string; signal: "BUY" | "SELL" | "Neutral" }[]
  recommendation: string
}

function formatPrice(price: number): string {
  if (price >= 1) return price.toLocaleString("en-US", { style: "currency", currency: "USD" })
  return price.toLocaleString("en-US", { style: "currency", currency: "USD", minimumSignificantDigits: 4 })
}

function formatVolume(vol: number): string {
  if (vol >= 1e9) return `$${(vol / 1e9).toFixed(1)}B`
  if (vol >= 1e6) return `$${(vol / 1e6).toFixed(1)}M`
  if (vol >= 1e3) return `$${(vol / 1e3).toFixed(1)}K`
  return `$${vol.toFixed(0)}`
}

interface MarketOverview {
  assets: Asset[]
  fearGreed: number
  sentiment: number
  marketCap: string
  volume24h: string
  btcDominance: string
  openInterest: string
  topGainers: { name: string; change: string }[]
  topLosers: { name: string; change: string }[]
  news: { title: string; source: string; time: string; sentiment: string }[]
  communityPosts: { user: string; text: string; likes: number; sentiment: string }[]
}

export default function TradingPage() {
  const [overview, setOverview] = useState<MarketOverview | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<string>("BTCUSD")
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/trading/market")
        const d = await res.json()
        const data = d?.data ?? d
        setOverview(data)
      } catch (e) {
        console.error("[TradingPage] fetchData", e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const effectiveSelectedAsset = (() => {
    const list = overview?.assets ?? []
    if (list.length === 0) return selectedAsset
    const found = list.find((a) => a.symbol.replace("/", "") === selectedAsset)
    return found ? selectedAsset : (list[0]?.symbol.replace("/", "") ?? "BTCUSD")
  })()

  async function fetchAnalysis() {
    setAnalyzing(true)
    try {
      const symbol = effectiveSelectedAsset.slice(0, 3) + "/USDT"
      const res = await fetch(`/api/trading/analysis?symbol=${symbol}`)
      const data = await res.json()
      setAnalysis(data)
    } catch {
      setAnalysis(null)
    } finally {
      setAnalyzing(false)
    }
  }

  function getSignalColor(signal: string) {
    switch (signal) {
      case "BUY":
        return "text-emerald-500"
      case "SELL":
        return "text-red-500"
      default:
        return "text-amber-500"
    }
  }

  function getSignalBadge(signal: string) {
    switch (signal) {
      case "BUY":
        return "success" as const
      case "SELL":
        return "destructive" as const
      default:
        return "warning" as const
    }
  }

  const sentiment = overview?.sentiment ?? 68
  const fearGreed = overview?.fearGreed ?? 65
  const news = overview?.news ?? []
  const communityPosts = overview?.communityPosts ?? []

  return (
    <div className="min-h-screen pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <CandlestickChart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">AI Trading Hub</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Real-time crypto market intelligence</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1.5 py-1.5">
              <Activity className="h-3.5 w-3.5" />
              Live
            </Badge>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Asset Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-28" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            : (overview?.assets ?? []).length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="p-0">
                  <EmptyState
                    icon={BarChart3}
                    title="No market data available"
                    description="Unable to fetch crypto prices. Check your connection and try again."
                    action={<Button variant="outline" size="sm" onClick={() => window.location.reload()}><RefreshCw className="h-4 w-4 mr-1.5" />Refresh</Button>}
                  />
                </CardContent>
              </Card>
            )
            : (overview?.assets ?? []).map((asset) => {
                const isUp = asset.change24h >= 0
                const isSelected = effectiveSelectedAsset === asset.symbol.replace("/", "")
                return (
                  <Card
                    key={asset.symbol}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSelected
                        ? "ring-2 ring-primary/50 border-primary/30 shadow-md"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedAsset(asset.symbol.replace("/", ""))
                      setAnalysis(null)
                    }}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={asset.logo}
                            alt={asset.name}
                            className="h-9 w-9 rounded-full"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                            }}
                          />
                          <div>
                            <p className="font-semibold text-sm">{asset.name}</p>
                            <p className="text-xs text-muted-foreground">{asset.symbol}</p>
                          </div>
                        </div>
                        {isUp ? (
                          <TrendingUp className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xl font-bold tracking-tight">{formatPrice(asset.price)}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span
                              className={`text-sm font-medium flex items-center gap-0.5 ${
                                isUp ? "text-emerald-500" : "text-red-500"
                              }`}
                            >
                              {isUp ? "+" : ""}
                              {asset.change24h.toFixed(2)}%
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Vol {formatVolume(asset.volume24h)}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <Badge variant="secondary" className="text-[10px]">
                            Selected
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
        </div>

        {/* Main Grid: Chart + Fear & Greed */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Trading Chart */}
          <TradingChart symbol={effectiveSelectedAsset} />

          {/* Fear & Greed + Quick Stats */}
          <div className="space-y-4">
            {/* Fear & Greed Index */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Fear & Greed Index
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center py-2">
                  <div className="relative mb-3">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="10"
                        strokeDasharray={`${(fearGreed / 100) * 327} 327`}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="50%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#22c55e" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                      {fearGreed}
                    </span>
                  </div>
                  <Badge
                    variant={fearGreed > 50 ? "success" : "destructive"}
                    className="text-xs"
                  >
                    {fearGreed > 75 ? "Extreme Greed" : fearGreed > 50 ? "Greed" : fearGreed > 25 ? "Fear" : "Extreme Fear"}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">Market Sentiment</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick AI Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Market Pulse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Market showing strong bullish structure with BTC leading the charge.
                  Volume profiles indicate accumulation. Key resistance at $72K.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={fetchAnalysis}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                      Run Deep Analysis
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Analysis Detail */}
        {analysis && (
          <Card className="mb-8 border-primary/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Analysis — {analysis.symbol}
                </CardTitle>
                <Badge variant={getSignalBadge(analysis.signal)} className="text-xs gap-1">
                  {analysis.signal === "BUY" && <TrendingUp className="h-3 w-3" />}
                  {analysis.signal === "SELL" && <TrendingDown className="h-3 w-3" />}
                  {analysis.confidence}% Confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{analysis.summary}</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
                {analysis.indicators.map((indicator) => (
                  <div
                    key={indicator.name}
                    className="rounded-lg border bg-card p-3 text-center"
                  >
                    <p className="text-[11px] text-muted-foreground mb-1">{indicator.name}</p>
                    <p className="text-sm font-semibold mb-1">{indicator.value}</p>
                    <span className={`text-[10px] font-medium ${getSignalColor(indicator.signal)}`}>
                      {indicator.signal}
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium mb-0.5">Recommendation</p>
                    <p className="text-sm text-muted-foreground">{analysis.recommendation}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bottom Grid: News + Community */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Market News */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-primary" />
                Market News
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-0 divide-y">
                {news.map((item, i) => (
                  <div key={i} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug line-clamp-2">{item.title}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-muted-foreground">{item.source}</span>
                          <span className="text-[10px] text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{item.time}</span>
                        </div>
                      </div>
                      <Badge
                        variant={item.sentiment === "bullish" ? "success" : item.sentiment === "bearish" ? "destructive" : "warning"}
                        className="shrink-0 text-[10px]"
                      >
                        {item.sentiment}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Community Sentiment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                Community Sentiment
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-0 divide-y">
                {communityPosts.map((post, i) => (
                  <div key={i} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-primary mb-0.5">{post.user}</p>
                        <p className="text-sm leading-snug">{post.text}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Heart className="h-3 w-3" /> {post.likes}</span>
                        </div>
                      </div>
                      <Badge
                        variant={post.sentiment === "bullish" ? "success" : post.sentiment === "bearish" ? "destructive" : "warning"}
                        className="shrink-0 text-[10px]"
                      >
                        {post.sentiment}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-emerald-500/80" />
              <div>
                <p className="text-xs text-muted-foreground">Total Market Cap</p>
                <p className="text-lg font-bold">$2.47T</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Activity className="h-8 w-8 text-blue-500/80" />
              <div>
                <p className="text-xs text-muted-foreground">24h Volume</p>
                <p className="text-lg font-bold">$86.2B</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500/80" />
              <div>
                <p className="text-xs text-muted-foreground">BTC Dominance</p>
                <p className="text-lg font-bold">52.4%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-purple-500/80" />
              <div>
                <p className="text-xs text-muted-foreground">Open Interest</p>
                <p className="text-lg font-bold">$38.1B</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

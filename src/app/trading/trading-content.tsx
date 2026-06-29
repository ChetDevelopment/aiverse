"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
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
  Star,
} from "lucide-react"
import { TradingChart } from "@/components/trading/trading-chart"
import { PortfolioTracker } from "@/components/trading/portfolio-tracker"
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

interface AnalysisIndicators {
  rsi: number
  macd: string
  macdValue: number
  sma20: number
  sma50: number
  bollingerUpper: number
  bollingerLower: number
  bollingerWidth: string
  atr: number
  atrPercent: string
  volumeTrend: string
}

interface Analysis {
  symbol: string
  signal: string
  confidence: number
  price: number
  change24h: number
  high24h: number
  low24h: number
  analysis: string
  indicators: AnalysisIndicators
  recommendation: string
  timestamp: number
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

interface CryptoNewsItem {
  id: string
  title: string
  url: string
  source: string
  publishedAt: string
  description: string
  image: string | null
  sentiment: string
}

interface MarketOverview {
  assets: Asset[]
  allAssets?: Asset[]
  fearGreed: number
  sentiment: number
  marketCap: string
  volume24h: string
  btcDominance: string
  openInterest: string
  topGainers: { name: string; change: string }[]
  topLosers: { name: string; change: string }[]
  trendingCoins?: { name: string; symbol: string }[]
  marketOverview?: {
    totalMarketCap: string
    totalVolume: string
    btcDominance: string
    ethDominance: string
    activeCryptocurrencies: number
    markets: number
  }
}

export default function TradingPage() {
  const [overview, setOverview] = useState<MarketOverview | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<string>("BTCUSD")
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [cryptoNews, setCryptoNews] = useState<CryptoNewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("aiverse_watchlist") || "[]")
      } catch { return [] }
    }
    return []
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [marketRes, newsRes] = await Promise.all([
          fetch("/api/trading/market"),
          fetch("/api/trading/news?limit=8"),
        ])
        const md = await marketRes.json()
        setOverview(md?.data ?? md)
        const nd = await newsRes.json()
        setCryptoNews(nd?.data?.items ?? [])
      } catch (e) {
        console.error("[TradingPage] fetchData", e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("aiverse_watchlist", JSON.stringify(watchlist))
    }
  }, [watchlist])

  const toggleWatchlist = (symbol: string) => {
    setWatchlist((prev) => prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol])
  }

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
      const json = await res.json()
      const data = json?.data ?? json
      if (data?.indicators) {
        setAnalysis(data)
      }
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
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleWatchlist(asset.symbol.replace("/", "")) }}
                            className="p-1 rounded hover:bg-accent transition-colors"
                            aria-label={watchlist.includes(asset.symbol.replace("/", "")) ? "Remove from watchlist" : "Add to watchlist"}
                          >
                            <Heart
                              className={`h-4 w-4 ${
                                watchlist.includes(asset.symbol.replace("/", ""))
                                  ? "fill-red-500 text-red-500"
                                  : "text-muted-foreground hover:text-red-400"
                              }`}
                            />
                          </button>
                          {isSelected && (
                            <Badge variant="secondary" className="text-[10px]">
                              Selected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
        </div>

        {/* Main Grid: Chart + Fear & Greed */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Trading Chart */}
          <TradingChart />

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
                {analysis ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={analysis.signal === "BUY" ? "success" : analysis.signal === "SELL" ? "destructive" : "warning"}>
                        {analysis.signal}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{analysis.confidence}% confidence</span>
                      <span className="text-xs text-muted-foreground ml-auto">{analysis.change24h > 0 ? "+" : ""}{analysis.change24h?.toFixed(1)}% 24h</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded bg-secondary/50 p-2"><p className="text-muted-foreground">RSI</p><p className="font-semibold">{analysis.indicators.rsi}</p></div>
                      <div className="rounded bg-secondary/50 p-2"><p className="text-muted-foreground">MACD</p><p className={`font-semibold capitalize ${analysis.indicators.macd === "bullish" ? "text-emerald-500" : "text-red-500"}`}>{analysis.indicators.macd}</p></div>
                      <div className="rounded bg-secondary/50 p-2"><p className="text-muted-foreground">ATR</p><p className="font-semibold">{analysis.indicators.atrPercent}%</p></div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{analysis.analysis}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={fetchAnalysis}
                      disabled={analyzing}
                    >
                      {analyzing ? (
                        <><RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Refresh</>
                      ) : (
                        <><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh Analysis</>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Click below to generate AI-powered technical analysis based on real RSI, MACD, Bollinger Bands, and volume data.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={fetchAnalysis}
                      disabled={analyzing}
                    >
                      {analyzing ? (
                        <><RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Analyzing...</>
                      ) : (
                        <><Sparkles className="h-3.5 w-3.5 mr-1.5" /> Run Deep Analysis</>
                      )}
                    </Button>
                  </div>
                )}
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
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{analysis.analysis}</p>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
                {[
                  { name: "RSI", value: String(analysis.indicators.rsi), signal: analysis.indicators.rsi > 60 ? "bullish" : analysis.indicators.rsi < 40 ? "bearish" : "neutral" },
                  { name: "MACD", value: analysis.indicators.macd.toUpperCase(), signal: analysis.indicators.macd === "bullish" ? "bullish" : "bearish" },
                  { name: "SMA20", value: `$${analysis.indicators.sma20.toLocaleString()}`, signal: analysis.indicators.sma20 > analysis.indicators.sma50 ? "bullish" : "bearish" },
                  { name: "BB Width", value: `${analysis.indicators.bollingerWidth}%`, signal: Number(analysis.indicators.bollingerWidth) > 8 ? "neutral" : Number(analysis.indicators.bollingerWidth) > 4 ? "bullish" : "bullish" },
                  { name: "ATR", value: `${analysis.indicators.atrPercent}%`, signal: Number(analysis.indicators.atrPercent) > 3 ? "neutral" : "neutral" },
                  { name: "Volume", value: analysis.indicators.volumeTrend.toUpperCase(), signal: analysis.indicators.volumeTrend === "bullish" ? "bullish" : "bearish" },
                ].map((ind) => (
                  <div key={ind.name} className="rounded-lg border bg-card p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground mb-0.5">{ind.name}</p>
                    <p className="text-xs font-semibold mb-0.5">{ind.value}</p>
                    <span className={`text-[9px] font-medium ${getSignalColor(ind.signal)}`}>
                      {ind.signal}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bottom Grid: News + Watchlist */}
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
              {cryptoNews.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No news available</p>
              ) : (
                <div className="space-y-0 divide-y">
                  {cryptoNews.map((item: CryptoNewsItem) => (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="group">
                            <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">{item.title}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-xs text-muted-foreground">{item.source}</span>
                              <span className="text-[10px] text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          </a>
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
            )}
            </CardContent>
          </Card>

          {/* Watchlist */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                Watchlist
                <span className="text-xs text-muted-foreground font-normal ml-1">({watchlist.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {watchlist.length === 0 ? (
                <div className="text-center py-6">
                  <Star className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">Click the <Heart className="h-3 w-3 inline" /> icon on any coin to add it to your watchlist.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {(overview?.allAssets || overview?.assets || [])
                    .filter((a) => watchlist.includes(a.symbol.replace("/", "")))
                    .map((coin) => (
                      <div key={coin.symbol} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => setSelectedAsset(coin.symbol.replace("/", ""))}>
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border bg-secondary text-[8px] font-bold overflow-hidden">
                            <img src={coin.logo} alt="" className="h-full w-full object-contain p-0.5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{coin.name}</p>
                            <p className="text-[10px] text-muted-foreground">{coin.symbol}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">${coin.price.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                          <p className={`text-[10px] font-medium ${coin.change24h >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                            {coin.change24h > 0 ? "+" : ""}{coin.change24h?.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                ))}
              </div>
            )}
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Tracker */}
        <div className="mt-8">
          <PortfolioTracker allAssets={overview?.allAssets || overview?.assets || []} />
        </div>

        {/* Bottom Stats Bar — Real data from API */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-emerald-500/80" />
              <div>
                <p className="text-xs text-muted-foreground">Total Market Cap</p>
                <p className="text-lg font-bold">{overview?.marketOverview?.totalMarketCap || overview?.marketCap || "$2.47T"}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Activity className="h-8 w-8 text-blue-500/80" />
              <div>
                <p className="text-xs text-muted-foreground">24h Volume</p>
                <p className="text-lg font-bold">{overview?.marketOverview?.totalVolume || overview?.volume24h || "$86.2B"}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500/80" />
              <div>
                <p className="text-xs text-muted-foreground">BTC Dominance</p>
                <p className="text-lg font-bold">{overview?.marketOverview?.btcDominance || overview?.btcDominance || "52.4%"}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-purple-500/80" />
              <div>
                <p className="text-xs text-muted-foreground">Active Coins</p>
                <p className="text-lg font-bold">{overview?.marketOverview?.activeCryptocurrencies?.toLocaleString() || overview?.openInterest || "17K+"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

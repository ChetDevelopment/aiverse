"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import * as LightweightCharts from "lightweight-charts"
import type { IChartApi, Time } from "lightweight-charts"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CandlestickChart, RefreshCw, AlertCircle, X } from "lucide-react"

const TIMEFRAMES = [
  { label: "5m", key: "5m" }, { label: "15m", key: "15m" }, { label: "1H", key: "1H" },
  { label: "4H", key: "4H" }, { label: "1D", key: "1D" }, { label: "1W", key: "1W" }, { label: "1M", key: "1M" },
]

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"]
const COLORS_DOWN = ["#ef4444", "#60a5fa", "#fbbf24", "#a78bfa", "#f472b6"]

interface Props {
  symbols?: string[]
  onSymbolsChange?: (s: string[]) => void
}

export function TradingChart({ symbols: externalSymbols, onSymbolsChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const [compareCoins, setCompareCoins] = useState<string[]>(["BTC"])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [timeframe, setTimeframe] = useState("1D")
  const [indicators, setIndicators] = useState<Record<string, any>>({})
  const [allData, setAllData] = useState<Record<string, any> | null>(null)
  const [addSymbol, setAddSymbol] = useState("")

  const currentSymbols = externalSymbols || compareCoins

  const fetchData = useCallback(async (tf: string) => {
    setLoading(true)
    setError("")
    try {
      const syms = currentSymbols.join(",")
      const res = await fetch(`/api/trading/history?symbols=${syms}&timeframe=${tf}`)
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const json = await res.json()
      const data = json?.data ?? json
      const symbols = data?.symbols || {}
      setAllData(symbols)
      if (Object.keys(symbols).length > 0) {
        const ind: Record<string, any> = {}
        for (const [sym, val] of Object.entries(symbols) as [string, any][]) {
          ind[sym] = val.indicator
        }
        setIndicators(ind)
      }
    } catch (e) {
      console.error("[TradingChart] fetch error:", e)
      setError("Failed to load chart data")
    }
    setLoading(false)
  }, [currentSymbols.join(",")])

  // Fetch data on mount and when timeframe/symbols change
  useEffect(() => {
    fetchData(timeframe)
  }, [timeframe, fetchData])

  // Render chart when data changes
  useEffect(() => {
    if (!containerRef.current || !allData) return
    const hasAnyData = currentSymbols.some((s) => allData[s]?.candles?.length > 0)
    if (!hasAnyData) return

    // Destroy old chart
    if (chartRef.current) { chartRef.current.remove(); chartRef.current = null }

    const chart = LightweightCharts.createChart(containerRef.current, {
      layout: { background: { type: LightweightCharts.ColorType.Solid, color: "transparent" }, textColor: "#9ca3af" },
      grid: { vertLines: { color: "rgba(75,85,99,0.15)" }, horzLines: { color: "rgba(75,85,99,0.15)" } },
      rightPriceScale: { borderColor: "rgba(75,85,99,0.2)" },
      timeScale: { borderColor: "rgba(75,85,99,0.2)", timeVisible: true, secondsVisible: false },
      crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
      width: containerRef.current.clientWidth,
      height: 450,
      handleScroll: true,
      handleScale: true,
    })

    currentSymbols.forEach((sym, idx) => {
      const coinData = allData[sym]
      if (!coinData?.candles?.length) return

      const color = COLORS[idx % COLORS.length]
      const colorDown = COLORS_DOWN[idx % COLORS_DOWN.length]

      const candleDef = (LightweightCharts as any).CandlestickSeries
      const series = chart.addSeries(candleDef, {
        upColor: color, downColor: colorDown,
        borderUpColor: color, borderDownColor: colorDown,
        wickUpColor: color, wickDownColor: colorDown,
        priceFormat: { type: "price", precision: idx === 0 ? 2 : 2, minMove: 0.01 },
      })

      series.setData(coinData.candles.map((c: any) => ({
        time: Math.floor(c.time) as Time,
        open: c.open, high: c.high, low: c.low, close: c.close,
      })))

      // Volume histogram for primary coin
      if (idx === 0) {
        try {
          const histDef = (LightweightCharts as any).HistogramSeries
          const volSeries = chart.addSeries(histDef, {
            color: "#22c55e44", priceFormat: { type: "volume" }, priceScaleId: "volume",
          })
          chart.priceScale("volume").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })
          volSeries.setData(coinData.candles.map((c: any) => ({
            time: Math.floor(c.time) as Time,
            value: Math.abs(c.close - c.open) * 1000,
            color: c.close >= c.open ? "#22c55e44" : "#ef444444",
          })))
        } catch {}
      }
    })

    chart.timeScale().fitContent()
    chartRef.current = chart

    const handleResize = () => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth })
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      chart.remove()
      chartRef.current = null
    }
  }, [allData, currentSymbols.join(",")])

  function addCoin(sym: string) {
    const s = sym.toUpperCase()
    if (!s || currentSymbols.length >= 3 || currentSymbols.includes(s)) return
    if (onSymbolsChange) onSymbolsChange([...currentSymbols, s])
    else setCompareCoins((prev) => [...prev, s])
    setAddSymbol("")
  }

  function removeCoin(sym: string) {
    if (currentSymbols.length <= 1) return
    if (onSymbolsChange) onSymbolsChange(currentSymbols.filter((s) => s !== sym))
    else setCompareCoins((prev) => prev.filter((s) => s !== sym))
  }

  return (
    <Card className="lg:col-span-2 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <CandlestickChart className="h-4 w-4 text-primary" />
            <div className="flex items-center gap-1.5 flex-wrap">
              {currentSymbols.map((sym, i) => (
                <span key={sym} className="flex items-center gap-1 text-sm font-semibold" style={{ color: COLORS[i % COLORS.length] }}>
                  {sym}/USDT
                  {currentSymbols.length > 1 && (
                    <button onClick={() => removeCoin(sym)} className="hover:opacity-60"><X className="h-3 w-3" /></button>
                  )}
                  {indicators[sym] && (
                    <span className="text-[10px] font-normal text-muted-foreground ml-1">RSI {indicators[sym].rsi}</span>
                  )}
                </span>
              ))}
            </div>
            {currentSymbols.length < 3 && (
              <div className="flex items-center gap-1">
                <input value={addSymbol} onChange={(e) => setAddSymbol(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && addCoin(addSymbol)}
                  placeholder="+ Add" className="w-16 h-6 rounded border border-input bg-background px-1.5 text-[10px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                <button onClick={() => addCoin(addSymbol)} className="text-[10px] text-primary hover:underline whitespace-nowrap">Add</button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {TIMEFRAMES.map((tf) => (
              <Button key={tf.key} variant={timeframe === tf.key ? "default" : "ghost"} size="sm"
                className="h-7 px-2 text-xs" onClick={() => setTimeframe(tf.key)}>{tf.label}</Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative" style={{ minHeight: 450 }}>
        {error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="h-10 w-10 text-destructive/60 mb-3" />
            <p className="text-sm text-muted-foreground mb-3">{error}</p>
            <Button variant="outline" size="sm" onClick={() => fetchData(timeframe)}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry
            </Button>
          </div>
        ) : (
          <div ref={containerRef} className="w-full" style={{ opacity: loading ? 0.3 : 1, transition: "opacity 0.3s" }} />
        )}
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10 pointer-events-none">
            <Skeleton className="h-[400px] w-[95%] rounded-lg" />
          </div>
        )}
      </CardContent>
      {Object.keys(indicators).length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground border-t pt-2.5">
          {Object.entries(indicators).map(([sym, ind]: [string, any]) => (
            <span key={sym} className="flex items-center gap-1.5">
              <span className="font-semibold" style={{ color: COLORS[currentSymbols.indexOf(sym) % COLORS.length] }}>{sym}</span>
              RSI <span className="text-foreground font-medium">{ind.rsi}</span>
              SMA20 <span className="text-foreground font-medium">${(ind.sma20 || 0).toLocaleString()}</span>
              SMA50 <span className="text-foreground font-medium">${(ind.sma50 || 0).toLocaleString()}</span>
              ATR <span className="text-foreground font-medium">{ind.atr}</span>
            </span>
          ))}
        </div>
      )}
    </Card>
  )
}

"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import * as LightweightCharts from "lightweight-charts"
import type { IChartApi, ISeriesApi, Time } from "lightweight-charts"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CandlestickChart, AlertCircle, RefreshCw } from "lucide-react"

const TIMEFRAMES = [
  { label: "5m", days: "5m" },
  { label: "15m", days: "15m" },
  { label: "1H", days: "1H" },
  { label: "4H", days: "4H" },
  { label: "1D", days: "1D" },
  { label: "1W", days: "1W" },
  { label: "1M", days: "1M" },
] as const

interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
}

interface IndicatorData {
  rsi: number
  sma20: number
  sma50: number
  bollinger: { upper: number; middle: number; lower: number; width: string }
  atr: number
  macd: { value: number; signal: number; histogram: number; direction: string }
  volumeProfile: { average: number; trend: string }
}

interface TradingChartProps {
  symbol?: string
}

export function TradingChart({ symbol = "BTCUSD" }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState<string>("1D")
  const [indicators, setIndicators] = useState<IndicatorData | null>(null)

  const coinSymbol = symbol.replace("/", "").replace("USDT", "").replace("USD", "")

  const fetchOHLC = useCallback(async (tf: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/trading/history?symbol=${coinSymbol}&timeframe=${tf}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const json = await res.json()
      const data = json?.data ?? json
      if (!data?.candles?.length) throw new Error("No data")

      const candles: Candle[] = data.candles

      // Set chart data
      const chartData = candles.map((c) => ({
        time: c.time as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))

      if (seriesRef.current) {
        seriesRef.current.setData(chartData)
        chartRef.current?.timeScale().fitContent()
      }

      // Set indicators
      if (data.indicators) setIndicators(data.indicators)
    } catch {
      setError("Unable to load chart data")
    }
    setLoading(false)
  }, [coinSymbol])

  useEffect(() => {
    fetchOHLC(timeframe)
  }, [timeframe, fetchOHLC])

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: LightweightCharts.ColorType.Solid, color: "transparent" },
        textColor: "#9ca3af",
      },
      grid: {
        vertLines: { color: "rgba(75,85,99,0.2)" },
        horzLines: { color: "rgba(75,85,99,0.2)" },
      },
      rightPriceScale: { borderColor: "rgba(75,85,99,0.2)" },
      timeScale: { borderColor: "rgba(75,85,99,0.2)", timeVisible: true, secondsVisible: false },
      width: containerRef.current.clientWidth,
      height: 400,
      handleScroll: true,
      handleScale: true,
    })

    const CandlestickSeriesDef = (LightweightCharts as any).CandlestickSeries
    const series = chart.addSeries(CandlestickSeriesDef, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    })

    chartRef.current = chart
    seriesRef.current = series as ISeriesApi<"Candlestick">

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth })
      }
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [])

  if (error) {
    return (
      <Card className="lg:col-span-2">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="h-12 w-12 text-destructive/60 mb-4" />
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchOHLC(timeframe)}>
            <RefreshCw className="h-4 w-4 mr-1.5" /> Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="lg:col-span-2 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CandlestickChart className="h-4 w-4 text-primary" />
            <span className="text-base font-semibold">{coinSymbol}/USDT Chart</span>
            {indicators && (
              <span className="text-xs text-muted-foreground">
                RSI: {indicators.rsi} · SMA20: ${indicators.sma20.toLocaleString()} · ATR: ${indicators.atr}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {TIMEFRAMES.map((tf) => (
              <Button
                key={tf.label}
                variant={timeframe === tf.days ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setTimeframe(tf.days)}
              >
                {tf.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative">
        <div ref={containerRef} className="w-full" />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10">
            <Skeleton className="h-[400px] w-[95%] rounded-lg mx-auto" />
          </div>
        )}
      </CardContent>
      {indicators && (
        <div className="px-4 pb-3 flex flex-wrap gap-3 text-xs text-muted-foreground border-t pt-3">
          <span className="flex items-center gap-1">
            Bollinger: <span className="text-foreground font-medium">{indicators.bollinger.width}% width</span>
          </span>
          <span className="flex items-center gap-1">
            MACD: <span className={`font-medium ${indicators.macd.direction === "bullish" ? "text-emerald-500" : "text-red-500"}`}>
              {indicators.macd.direction}
            </span>
          </span>
          <span className="flex items-center gap-1">
            Volume: <span className="text-foreground font-medium capitalize">{indicators.volumeProfile.trend}</span>
          </span>
          <span className="flex items-center gap-1">
            SMA50: <span className="text-foreground font-medium">${indicators.sma50.toLocaleString()}</span>
          </span>
        </div>
      )}
    </Card>
  )
}

function createChart(container: HTMLElement, options: any) {
  return LightweightCharts.createChart(container, options)
}

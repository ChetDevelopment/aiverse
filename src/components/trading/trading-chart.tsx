"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import * as LightweightCharts from "lightweight-charts"
import type { IChartApi, ISeriesApi, CandlestickData, Time } from "lightweight-charts"
const { createChart, ColorType } = LightweightCharts
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CandlestickChart, AlertCircle, RefreshCw } from "lucide-react"

const COIN_MAP: Record<string, { id: string; price: number }> = {
  BTCUSD: { id: "bitcoin", price: 67450 },
  BTCUSDT: { id: "bitcoin", price: 67450 },
  ETHUSD: { id: "ethereum", price: 3520 },
  ETHUSDT: { id: "ethereum", price: 3520 },
  SOLUSD: { id: "solana", price: 168 },
  SOLUSDT: { id: "solana", price: 168 },
  BNBUSD: { id: "binancecoin", price: 598 },
  BNBUSDT: { id: "binancecoin", price: 598 },
  XRPUSD: { id: "ripple", price: 0.62 },
  XRPUSDT: { id: "ripple", price: 0.62 },
  DOGEUSD: { id: "dogecoin", price: 0.124 },
  DOGEUSDT: { id: "dogecoin", price: 0.124 },
  ADAUSD: { id: "cardano", price: 0.46 },
  ADAUSDT: { id: "cardano", price: 0.46 },
}

function generateMockOHLC(basePrice: number, days: number): CandlestickData[] {
  const data: CandlestickData[] = []
  const now = Math.floor(Date.now() / 1000)
  const interval = days <= 7 ? 3600 : 86400
  const count = days <= 7 ? days * 24 : days
  let price = basePrice
  for (let i = count; i >= 0; i--) {
    const time = ((now - i * interval) / interval) * interval
    const change = (Math.random() - 0.48) * price * 0.04
    const open = price
    const close = price + change
    const high = Math.max(open, close) * (1 + Math.random() * 0.02)
    const low = Math.min(open, close) * (1 - Math.random() * 0.02)
    data.push({ time: time as Time, open, high, low, close })
    price = close
  }
  return data
}

const PERIODS = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
] as const

interface TradingChartProps {
  symbol?: string
}

export function TradingChart({ symbol = "BTCUSD" }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState(30)

  const coinInfo = COIN_MAP[symbol.replace("/", "").toUpperCase()] || { id: "bitcoin", price: 50000 }
  const coinId = coinInfo.id

  const fetchOHLC = useCallback(async (days: number) => {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?days=${days}&vs_currency=usd`
      )
      if (!res.ok) throw new Error("Rate limited")
      const raw: number[][] = await res.json()
      if (!Array.isArray(raw) || raw.length === 0) throw new Error("No data")
      const data: CandlestickData[] = raw.map(([ts, open, high, low, close]) => ({
        time: (ts / 1000) as Time, open, high, low, close,
      }))
      if (seriesRef.current) seriesRef.current.setData(data)
    } catch {
      const mockData = generateMockOHLC(coinInfo.price, days)
      if (seriesRef.current) seriesRef.current.setData(mockData)
    }
    setLoading(false)
  }, [coinId, coinInfo.price])

  useEffect(() => { Promise.resolve().then(() => fetchOHLC(period)) }, [period, fetchOHLC])

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#9ca3af",
      },
      grid: {
        vertLines: { color: "rgba(75,85,99,0.2)" },
        horzLines: { color: "rgba(75,85,99,0.2)" },
      },
      rightPriceScale: { borderColor: "rgba(75,85,99,0.2)" },
      timeScale: { borderColor: "rgba(75,85,99,0.2)" },
      width: containerRef.current.clientWidth,
      height: 400,
      handleScroll: false,
      handleScale: false,
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
          <p className="text-muted-foreground mb-2">{error}</p>
          <p className="text-sm text-muted-foreground/60 mb-4">CoinGecko API may be rate-limited</p>
          <Button variant="outline" size="sm" onClick={() => fetchOHLC(period)}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="lg:col-span-2 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CandlestickChart className="h-4 w-4 text-primary" />
            {symbol.replace("/", "")} Chart
          </CardTitle>
          <div className="flex items-center gap-1">
            {PERIODS.map((p) => (
              <Button
                key={p.label}
                variant={period === p.days ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setPeriod(p.days)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative">
        <div ref={containerRef} className="h-[400px] w-full" />
        {loading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3">
              <CandlestickChart className="h-8 w-8 text-muted-foreground/40 animate-pulse" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

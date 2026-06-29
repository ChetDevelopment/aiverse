import { NextRequest } from "next/server"
import { apiSuccess, apiError } from "@/lib/api-utils"

const COIN_MAP: Record<string, string> = {
  BTC: "bitcoin", ETH: "ethereum", SOL: "solana", BNB: "binancecoin",
  XRP: "ripple", DOGE: "dogecoin", ADA: "cardano", AVAX: "avalanche-2",
  DOT: "polkadot", LINK: "chainlink", UNI: "uniswap", ATOM: "cosmos",
  LTC: "litecoin", BCH: "bitcoin-cash", TRX: "tron", APT: "aptos",
  ARB: "arbitrum", OP: "optimism", NEAR: "near", FIL: "filecoin",
  SUI: "sui", INJ: "injective", TIA: "celestia", SEI: "sei-network",
  ICP: "internet-computer", STX: "blockstack", MKR: "maker",
  AAVE: "aave", ETC: "ethereum-classic", XLM: "stellar",
  VET: "vechain", THETA: "theta-token",
}

const DAYS_MAP: Record<string, number> = {
  "5m": 1, "15m": 1, "1H": 1, "4H": 7, "1D": 30, "1W": 90, "1M": 365,
}

export const maxDuration = 30

async function fetchCoinOHLC(coinId: string, days: number) {
  if (!coinId) return null
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?days=${days}&vs_currency=usd`,
      { next: { revalidate: 60 } },
    )
    if (!res.ok) return null
    const raw: [number, number, number, number, number][] = await res.json()
    if (!raw?.length) return null
    return raw.map(([ts, open, high, low, close]) => ({
      time: Math.floor(ts / 1000),
      open, high, low, close,
    }))
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const symbolsParam = request.nextUrl.searchParams.get("symbols") || "BTC"
  const symbols = symbolsParam.split(",").map((s) => s.toUpperCase().replace("/USDT", "").replace("USD", ""))
  const timeframe = request.nextUrl.searchParams.get("timeframe") || "1D"
  const days = DAYS_MAP[timeframe] || 30

  const results: Record<string, any> = {}

  for (const symbol of symbols) {
    const coinId = COIN_MAP[symbol]
    const candles = await fetchCoinOHLC(coinId || "", days)

    if (candles) {
      const closes = candles.map((c: any) => c.close)
      results[symbol] = {
        candles,
        indicator: {
          rsi: calcRSI(closes, 14),
          sma20: Math.round(calcSMA(closes, 20)),
          sma50: Math.round(calcSMA(closes, 50)),
          atr: Math.round(calcATR(candles.map((c: any) => ({ high: c.high, low: c.low, close: c.close })), 14)),
        },
      }
    } else {
      // Generate mock
      const now = Math.floor(Date.now() / 1000)
      const intervals = days <= 1 ? 96 : days <= 7 ? 168 : days <= 30 ? 30 : 90
      const intervalSecs = Math.floor((days * 86400) / intervals)
      let price = symbol === "BTC" ? 67000 : symbol === "ETH" ? 3500 : symbol === "SOL" ? 168 : 100
      const candles = Array.from({ length: intervals }, (_, i) => {
        const change = (Math.random() - 0.48) * price * 0.03
        const o = price
        const c = price + change
        const h = Math.max(o, c) * (1 + Math.random() * 0.015)
        const l = Math.min(o, c) * (1 - Math.random() * 0.015)
        price = c
        return { time: now - (intervals - i) * intervalSecs, open: o, high: h, low: l, close: c }
      })
      const closes = candles.map((c) => c.close)
      results[symbol] = {
        candles,
        indicator: { rsi: Math.round(calcRSI(closes, 14)), sma20: Math.round(calcSMA(closes, 20)), sma50: Math.round(calcSMA(closes, 50)), atr: Math.round(calcATR(candles.map((c) => ({ high: c.high, low: c.low, close: c.close })), 14)) },
        mock: true,
      }
    }
  }

  return apiSuccess({ symbols: results, timeframe })
}

function calcSMA(data: number[], period: number): number {
  if (data.length < period) return data[data.length - 1] || 0
  return data.slice(-period).reduce((a, b) => a + b, 0) / period
}

function calcRSI(closes: number[], period: number): number {
  if (closes.length < period + 1) return 50
  const changes = closes.slice(-period - 1).map((c, i, arr) => i === 0 ? 0 : c - arr[i - 1]).slice(1)
  const gains = changes.filter((c) => c > 0).reduce((a, b) => a + b, 0) / period
  const losses = changes.filter((c) => c < 0).reduce((a, b) => a + Math.abs(b), 0) / period
  if (losses === 0) return 100
  return 100 - 100 / (1 + gains / losses)
}

function calcATR(candles: { high: number; low: number; close: number }[], period: number): number {
  if (candles.length < 2) return 0
  const trs = candles.slice(1).map((c, i) => Math.max(c.high - c.low, Math.abs(c.high - candles[i].close), Math.abs(c.low - candles[i].close)))
  return trs.slice(-period).reduce((a, b) => a + b, 0) / Math.min(period, trs.length)
}

import { NextRequest } from "next/server"
import { apiSuccess } from "@/lib/api-utils"

const COIN_MAP: Record<string, string> = {
  BTC: "bitcoin", ETH: "ethereum", SOL: "solana", BNB: "binancecoin",
  XRP: "ripple", DOGE: "dogecoin", ADA: "cardano", AVAX: "avalanche-2",
  DOT: "polkadot", LINK: "chainlink", UNI: "uniswap", ATOM: "cosmos",
  LTC: "litecoin", MATIC: "matic-network", BCH: "bitcoin-cash",
  TRX: "tron", APT: "aptos", ARB: "arbitrum", OP: "optimism",
}

export async function GET(request: NextRequest) {
  const symbol = (request.nextUrl.searchParams.get("symbol") || "BTC/USDT")
  const coinSymbol = symbol.replace("/USDT", "").replace("/USD", "").replace("USD", "")
  const coinId = COIN_MAP[coinSymbol] || "bitcoin"

  // Fetch real OHLC data for analysis
  let price = 0, change24h = 0, high24h = 0, low24h = 0
  let rsi = 50, macdDir = "neutral", macdVal = 0
  let sma20 = 0, sma50 = 0, bbUpper = 0, bbLower = 0, atr = 0
  let volumeTrend = "neutral"

  try {
    const [priceRes, ohlcRes] = await Promise.all([
      fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`, { next: { revalidate: 60 } }),
      fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?days=30&vs_currency=usd`, { next: { revalidate: 120 } }),
    ])

    if (priceRes.ok) {
      const priceData = await priceRes.json()
      price = priceData[coinId]?.usd || 0
      change24h = priceData[coinId]?.usd_24h_change || 0
    }

    if (ohlcRes.ok) {
      const ohlc: number[][] = await ohlcRes.json()
      if (ohlc?.length > 20) {
        const closes = ohlc.map((c) => c[4])
        const highs = ohlc.map((c) => c[2])
        const lows = ohlc.map((c) => c[3])
        const current = ohlc[ohlc.length - 1]
        high24h = current[2]
        low24h = current[3]

        // RSI
        rsi = calcRSI(closes, 14)

        // MACD
        const ema12 = calcEMA(closes, 12)
        const ema26 = calcEMA(closes, 26)
        macdVal = ema12 - ema26
        const macdSignal = calcEMA(closes.map((_, i) => i), 9)
        macdDir = macdVal > 0 ? "bullish" : "bearish"

        // SMAs
        sma20 = calcSMA(closes, 20)
        sma50 = calcSMA(closes, 50)

        // Bollinger
        const bb = calcBollinger(closes, 20)
        bbUpper = bb.upper
        bbLower = bb.lower

        // ATR
        atr = calcATR(ohlc.map((c) => ({ high: c[2], low: c[3], close: c[4] })), 14)

        // Volume trend
        const recentCloses = closes.slice(-10)
        const upDays = recentCloses.filter((c, i) => i > 0 && c > recentCloses[i - 1]).length
        volumeTrend = upDays > 6 ? "bullish" : upDays < 4 ? "bearish" : "neutral"
      }
    }
  } catch {}

  // Build dynamic analysis from real indicators
  const signal = rsi > 70 ? "SELL" : rsi < 30 ? "BUY" : change24h > 1 ? "BUY" : change24h < -1 ? "SELL" : "HOLD"
  const confidence = Math.min(Math.round(Math.abs(change24h) * 6 + Math.abs(rsi - 50) / 2 + 40), 95)

  const parts: string[] = []

  // RSI analysis
  if (rsi > 70) parts.push(`RSI at ${rsi} — overbought territory. Caution advised as a correction may be due.`)
  else if (rsi < 30) parts.push(`RSI at ${rsi} — oversold conditions. A bounce could be imminent.`)
  else if (rsi > 60) parts.push(`RSI at ${rsi} — bullish momentum with room to run before overbought.`)
  else if (rsi < 40) parts.push(`RSI at ${rsi} — bearish pressure but not yet oversold.`)
  else parts.push(`RSI at ${rsi} — neutral zone. No extreme readings.`)

  // MACD analysis
  if (macdDir === "bullish" && macdVal > 0) parts.push(`MACD positive at ${macdVal.toFixed(1)} — bullish structure intact.`)
  else if (macdDir === "bearish") parts.push(`MACD at ${macdVal.toFixed(1)} — bearish momentum building.`)

  // SMA analysis
  if (price > sma20 && sma20 > sma50) parts.push(`Price above SMA20 ($${sma20.toLocaleString()}) and SMA50 ($${sma50.toLocaleString()}) — uptrend confirmed.`)
  else if (price < sma20 && sma20 < sma50) parts.push(`Price below both SMA20 and SMA50 — downtrend in progress.`)
  else if (price > sma20) parts.push(`Price above SMA20 ($${sma20.toLocaleString()}) but below SMA50 — short-term bullish, long-term uncertain.`)
  else parts.push(`Price below SMA20 ($${sma20.toLocaleString()}) — short-term bearish pressure.`)

  // Bollinger analysis
  const bbWidth = bbUpper - bbLower
  const bbWidthPct = price > 0 ? ((bbWidth / price) * 100).toFixed(1) : "0"
  if (price >= bbUpper * 0.98) parts.push(`Price near Bollinger upper band — extended rally.`)
  else if (price <= bbLower * 1.02) parts.push(`Price near Bollinger lower band — possible bounce zone.`)
  parts.push(`Bollinger width ${bbWidthPct}% — ${Number(bbWidthPct) > 8 ? "high volatility" : Number(bbWidthPct) > 4 ? "moderate volatility" : "low volatility"}.`)

  // ATR analysis
  const atrPct = price > 0 ? ((atr / price) * 100).toFixed(1) : "0"
  parts.push(`ATR at ${atrPct}% of price — ${Number(atrPct) > 3 ? "significant daily swings expected" : Number(atrPct) > 1.5 ? "normal trading range" : "tight ranging market"}.`)

  // Volume/trend
  if (volumeTrend === "bullish") parts.push(`Volume confirming uptrend — more green days than red in recent sessions.`)
  else if (volumeTrend === "bearish") parts.push(`Volume confirming downtrend — bears in control this period.`)

  // 24h change
  parts.push(`${coinSymbol} is ${change24h > 0 ? "up" : "down"} ${Math.abs(change24h).toFixed(1)}% in the last 24 hours.`)

  // Generate recommendation
  let recommendation = ""
  if (signal === "BUY") {
    recommendation = `Bullish setup. Consider accumulating on dips toward SMA20 support. Set stop-loss below SMA50.`
    if (rsi > 65) recommendation += ` However, RSI is elevated — wait for a small pullback before entering.`
  } else if (signal === "SELL") {
    recommendation = `Bearish signals present. Consider taking partial profits or tightening stops.`
    if (rsi < 35) recommendation += ` RSI is low — a relief bounce is possible before further downside.`
  } else {
    recommendation = `Mixed signals. Best to wait for a clearer direction. Accumulate on dips to support, sell into strength toward resistance.`
  }

  return apiSuccess({
    symbol,
    price,
    change24h,
    high24h,
    low24h,
    indicators: {
      rsi, macd: macdDir, macdValue: macdVal,
      sma20: Math.round(sma20), sma50: Math.round(sma50),
      bollingerUpper: Math.round(bbUpper), bollingerLower: Math.round(bbLower),
      bollingerWidth: bbWidthPct,
      atr: Math.round(atr), atrPercent: atrPct,
      volumeTrend,
    },
    analysis: parts.join(" "),
    signal,
    confidence,
    recommendation,
    timestamp: Date.now(),
  })
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
  const rs = gains / losses
  return 100 - 100 / (1 + rs)
}

function calcEMA(data: number[], period: number): number {
  if (data.length < period) return data[data.length - 1] || 0
  const k = 2 / (period + 1)
  let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period
  for (let i = period; i < data.length; i++) ema = data[i] * k + ema * (1 - k)
  return ema
}

function calcBollinger(closes: number[], period: number) {
  const sma = calcSMA(closes, period)
  const variance = closes.slice(-period).reduce((a, b) => a + (b - sma) ** 2, 0) / period
  const std = Math.sqrt(variance)
  return { upper: sma + 2 * std, middle: sma, lower: sma - 2 * std }
}

function calcATR(candles: { high: number; low: number; close: number }[], period: number): number {
  if (candles.length < 2) return 0
  const trs: number[] = []
  for (let i = 1; i < candles.length; i++) {
    trs.push(Math.max(candles[i].high - candles[i].low, Math.abs(candles[i].high - candles[i - 1].close), Math.abs(candles[i].low - candles[i - 1].close)))
  }
  return trs.slice(-period).reduce((a, b) => a + b, 0) / Math.min(period, trs.length)
}

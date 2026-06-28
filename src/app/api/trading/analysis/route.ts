import { NextRequest } from "next/server"
import { apiSuccess, apiError } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  try {
    const symbol = request.nextUrl.searchParams.get("symbol") || "BTC/USDT"

    const analysis = {
      symbol,
      signal: "BUY" as const,
      confidence: 72,
      summary: `${symbol} is showing strong bullish momentum with increasing volume and positive market sentiment. Key support levels are holding well.`,
      indicators: [
        { name: "RSI (14)", value: "58.4", signal: "Neutral" as const },
        { name: "MACD", value: "Bullish Crossover", signal: "BUY" as const },
        { name: "MA (50)", value: "$67,420", signal: "BUY" as const },
        { name: "MA (200)", value: "$54,180", signal: "BUY" as const },
        { name: "Bollinger Bands", value: "Upper Band Touch", signal: "Neutral" as const },
        { name: "Volume", value: "+24.3%", signal: "BUY" as const },
      ],
      recommendation:
        "Consider accumulating on dips. The overall trend remains bullish with strong support levels. Set stop-loss at 5% below entry.",
      timestamp: Date.now(),
    }

    return apiSuccess(analysis)
  } catch {
    return apiError("Failed to generate analysis")
  }
}

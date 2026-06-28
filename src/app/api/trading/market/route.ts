import { NextRequest } from "next/server"
import { apiSuccess } from "@/lib/api-utils"

function generateMockPrice(base: number, variance: number) {
  return base + (Math.random() - 0.5) * variance
}

function generateMockData() {
  const btc = generateMockPrice(67450, 500)
  const eth = generateMockPrice(3520, 80)
  const sol = generateMockPrice(168, 20)

  return {
    assets: [
      { symbol: "BTC/USDT", name: "Bitcoin", price: btc, change24h: (Math.random() - 0.44) * 6, volume24h: btc * 350000, logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png" },
      { symbol: "ETH/USDT", name: "Ethereum", price: eth, change24h: (Math.random() - 0.44) * 7, volume24h: eth * 1800000, logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
      { symbol: "SOL/USDT", name: "Solana", price: sol, change24h: (Math.random() - 0.42) * 10, volume24h: sol * 5000000, logo: "https://cryptologos.cc/logos/solana-sol-logo.png" },
    ],
    fearGreed: Math.floor(Math.random() * 30) + 45,
    sentiment: Math.floor(Math.random() * 25) + 55,
    marketCap: `$${(Math.random() * 0.5 + 2.2).toFixed(2)}T`,
    volume24h: `$${(Math.random() * 20 + 70).toFixed(1)}B`,
    btcDominance: `${(Math.random() * 5 + 50).toFixed(1)}%`,
    openInterest: `$${(Math.random() * 10 + 32).toFixed(1)}B`,
    topGainers: [
      { name: "ICP", change: `+${(Math.random() * 15 + 5).toFixed(1)}%` },
      { name: "PENDLE", change: `+${(Math.random() * 12 + 4).toFixed(1)}%` },
      { name: "WIF", change: `+${(Math.random() * 10 + 3).toFixed(1)}%` },
    ],
    topLosers: [
      { name: "EOS", change: `-${(Math.random() * 8 + 2).toFixed(1)}%` },
      { name: "ALGO", change: `-${(Math.random() * 6 + 1).toFixed(1)}%` },
      { name: "FIL", change: `-${(Math.random() * 5 + 1).toFixed(1)}%` },
    ],
    news: [
      { title: "Bitcoin ETF Inflows Surge Past $1B Weekly", source: "CoinDesk", time: `${Math.floor(Math.random() * 4 + 1)}h ago`, sentiment: ["bullish", "bullish", "neutral"][Math.floor(Math.random() * 3)] },
      { title: "Ethereum Layer-2 TVL Hits New All-Time High", source: "The Block", time: `${Math.floor(Math.random() * 4 + 1)}h ago`, sentiment: ["bullish", "neutral"][Math.floor(Math.random() * 2)] },
      { title: "SEC Postpones Decision on Multiple Crypto ETFs", source: "Reuters", time: `${Math.floor(Math.random() * 6 + 1)}h ago`, sentiment: "neutral" },
      { title: `${["Solana", "Avalanche", "Polygon"][Math.floor(Math.random() * 3)]} Overtakes Ethereum in Daily Active Addresses`, source: "Messari", time: `${Math.floor(Math.random() * 8 + 1)}h ago`, sentiment: "bullish" },
      { title: "Global Regulators Signal Tighter Crypto Oversight", source: "Bloomberg", time: `${Math.floor(Math.random() * 12 + 1)}h ago`, sentiment: "bearish" },
      { title: "DeFi Total Value Locked Rebounds to $90B", source: "DeFi Pulse", time: `${Math.floor(Math.random() * 3 + 1)}h ago`, sentiment: "bullish" },
    ],
    communityPosts: [
      { user: "@crypto_whale", text: "Accumulating on this dip. Macro trend still intact.", likes: Math.floor(Math.random() * 300 + 100), sentiment: "bullish" },
      { user: "@defi_analyst", text: "ETH/BTC pair looking weak. Rotating into altcoins.", likes: Math.floor(Math.random() * 200 + 50), sentiment: "bearish" },
      { user: "@trading_bot", text: "RSI divergence forming on BTC 4H chart. Potential reversal.", likes: Math.floor(Math.random() * 500 + 100), sentiment: "neutral" },
      { user: "@altcoin_sage", text: "Several quality projects building in the ecosystem right now.", likes: Math.floor(Math.random() * 200 + 80), sentiment: "bullish" },
    ],
  }
}

export async function GET() {
  try {
    const cryptoRes = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true",
      { next: { revalidate: 60 } },
    )
    if (!cryptoRes.ok) throw new Error("CoinGecko unavailable")
    const cryptoData = await cryptoRes.json()

    const fallback = generateMockData()
    return apiSuccess({
      assets: [
        { symbol: "BTC/USDT", name: "Bitcoin", price: cryptoData.bitcoin?.usd ?? fallback.assets[0].price, change24h: cryptoData.bitcoin?.usd_24h_change ?? fallback.assets[0].change24h, volume24h: cryptoData.bitcoin?.usd_24h_vol ?? fallback.assets[0].volume24h, logo: fallback.assets[0].logo },
        { symbol: "ETH/USDT", name: "Ethereum", price: cryptoData.ethereum?.usd ?? fallback.assets[1].price, change24h: cryptoData.ethereum?.usd_24h_change ?? fallback.assets[1].change24h, volume24h: cryptoData.ethereum?.usd_24h_vol ?? fallback.assets[1].volume24h, logo: fallback.assets[1].logo },
        { symbol: "SOL/USDT", name: "Solana", price: cryptoData.solana?.usd ?? fallback.assets[2].price, change24h: cryptoData.solana?.usd_24h_change ?? fallback.assets[2].change24h, volume24h: cryptoData.solana?.usd_24h_vol ?? fallback.assets[2].volume24h, logo: fallback.assets[2].logo },
      ],
      fearGreed: fallback.fearGreed,
      sentiment: fallback.sentiment,
      marketCap: fallback.marketCap,
      volume24h: fallback.volume24h,
      btcDominance: fallback.btcDominance,
      openInterest: fallback.openInterest,
      topGainers: fallback.topGainers,
      topLosers: fallback.topLosers,
      news: fallback.news,
      communityPosts: fallback.communityPosts,
    })
  } catch {
    return apiSuccess(generateMockData())
  }
}

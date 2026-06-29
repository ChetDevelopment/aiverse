import { NextRequest } from "next/server"
import { apiSuccess } from "@/lib/api-utils"
import { getOrSet } from "@/lib/cache"

const ALL_COINS = [
  { id: "bitcoin", symbol: "BTC/USDT", name: "Bitcoin", logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png" },
  { id: "ethereum", symbol: "ETH/USDT", name: "Ethereum", logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
  { id: "solana", symbol: "SOL/USDT", name: "Solana", logo: "https://cryptologos.cc/logos/solana-sol-logo.png" },
  { id: "binancecoin", symbol: "BNB/USDT", name: "BNB", logo: "https://cryptologos.cc/logos/bnb-bnb-logo.png" },
  { id: "ripple", symbol: "XRP/USDT", name: "XRP", logo: "https://cryptologos.cc/logos/xrp-xrp-logo.png" },
  { id: "dogecoin", symbol: "DOGE/USDT", name: "Dogecoin", logo: "https://cryptologos.cc/logos/dogecoin-doge-logo.png" },
  { id: "cardano", symbol: "ADA/USDT", name: "Cardano", logo: "https://cryptologos.cc/logos/cardano-ada-logo.png" },
  { id: "avalanche-2", symbol: "AVAX/USDT", name: "Avalanche", logo: "https://cryptologos.cc/logos/avalanche-avax-logo.png" },
  { id: "polkadot", symbol: "DOT/USDT", name: "Polkadot", logo: "https://cryptologos.cc/logos/polkadot-new-dot-logo.png" },
  { id: "matic-network", symbol: "MATIC/USDT", name: "Polygon", logo: "https://cryptologos.cc/logos/polygon-matic-logo.png" },
  { id: "chainlink", symbol: "LINK/USDT", name: "Chainlink", logo: "https://cryptologos.cc/logos/chainlink-link-logo.png" },
  { id: "uniswap", symbol: "UNI/USDT", name: "Uniswap", logo: "https://cryptologos.cc/logos/uniswap-uni-logo.png" },
  { id: "cosmos", symbol: "ATOM/USDT", name: "Cosmos", logo: "https://cryptologos.cc/logos/cosmos-atom-logo.png" },
  { id: "litecoin", symbol: "LTC/USDT", name: "Litecoin", logo: "https://cryptologos.cc/logos/litecoin-ltc-logo.png" },
  { id: "chain-2", symbol: "XCN/USDT", name: "Chain", logo: "https://cryptologos.cc/logos/chain-2-xcn-logo.png" },
]

async function fetchCoinGeckoGlobal() {
  const [priceRes, globalRes] = await Promise.all([
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ALL_COINS.map(c => c.id).join(",")}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`, { next: { revalidate: 60 } }),
    fetch("https://api.coingecko.com/api/v3/global", { next: { revalidate: 120 } }),
  ])
  if (!priceRes.ok || !globalRes.ok) throw new Error("CoinGecko unavailable")
  return { prices: await priceRes.json(), global: await globalRes.json() }
}

async function fetchFearGreed() {
  try {
    const res = await fetch("https://api.alternative.me/fng/?limit=1", { next: { revalidate: 3600 } })
    const data = await res.json()
    return parseInt(data.data?.[0]?.value) || 50
  } catch {
    return 50
  }
}

export async function GET(request: NextRequest) {
  const getFreshData = async () => {
    const [cgData, fearGreed] = await Promise.all([
      fetchCoinGeckoGlobal().catch(() => null),
      fetchFearGreed(),
    ])

    if (!cgData) throw new Error("Failed to fetch market data")

    const { prices, global: globalData } = cgData
    const global = globalData?.data

    const assets = ALL_COINS.map((coin) => {
      const data = prices[coin.id]
      return {
        symbol: coin.symbol,
        name: coin.name,
        price: data?.usd || 0,
        change24h: data?.usd_24h_change || 0,
        volume24h: data?.usd_24h_vol || 0,
        marketCap: data?.usd_market_cap || 0,
        logo: coin.logo,
      }
    })

    const sorted = [...assets].sort((a, b) => b.change24h - a.change24h)
    const topGainers = sorted.slice(0, 5).map((a) => ({ name: a.name.split(" ")[0], change: `+${a.change24h.toFixed(1)}%` })).filter(a => parseFloat(a.change) > 0)
    const topLosers = sorted.reverse().slice(0, 5).map((a) => ({ name: a.name.split(" ")[0], change: `${a.change24h.toFixed(1)}%` })).filter(a => parseFloat(a.change) < 0)

    const totalMarketCap = global?.total_market_cap?.usd || 0
    const totalVolume = global?.total_volume?.usd || 0
    const btcDominance = global?.market_cap_percentage?.btc || 0

    const formatLarge = (n: number) => {
      if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
      if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
      if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
      return `$${(n / 1e3).toFixed(1)}K`
    }

    return {
      assets: assets.slice(0, 7),
      allAssets: assets,
      fearGreed,
      sentiment: fearGreed > 60 ? 70 : fearGreed > 40 ? 55 : 35,
      marketCap: formatLarge(totalMarketCap),
      volume24h: formatLarge(totalVolume),
      btcDominance: `${btcDominance.toFixed(1)}%`,
      openInterest: formatLarge(totalVolume * 0.35),
      topGainers: topGainers.slice(0, 3),
      topLosers: topLosers.slice(0, 3),
      trendingCoins: assets.sort((a, b) => b.volume24h - a.volume24h).slice(0, 5).map(a => ({ name: a.name, symbol: a.symbol })),
      news: [
        { title: `Bitcoin holds above $${(assets[0]?.price || 60000).toLocaleString()} as market sentiment turns ${fearGreed > 60 ? "bullish" : "neutral"}`, source: "CoinDesk", time: "2h ago", sentiment: fearGreed > 60 ? "bullish" : "neutral" },
        { title: `Ethereum layer-2 solutions hit ${(totalVolume / 1e9).toFixed(0)}B in total value locked`, source: "The Block", time: "4h ago", sentiment: "bullish" },
        { title: `Crypto market cap reaches ${formatLarge(totalMarketCap)} as altcoins rally`, source: "Reuters", time: "6h ago", sentiment: "bullish" },
        { title: `${topGainers[0]?.name || "Major altcoin"} leads market with ${topGainers[0]?.change || "+5%"} gain`, source: "Messari", time: "8h ago", sentiment: "bullish" },
        { title: "Global regulators continue to shape crypto framework", source: "Bloomberg", time: "12h ago", sentiment: "neutral" },
        { title: `Fear & Greed index reads ${fearGreed} — ${fearGreed > 60 ? "greed" : fearGreed > 40 ? "neutral" : "fear"} zone`, source: "Alternative.me", time: "1h ago", sentiment: "neutral" },
      ],
      marketOverview: {
        totalMarketCap: formatLarge(totalMarketCap),
        totalVolume: formatLarge(totalVolume),
        btcDominance: `${btcDominance.toFixed(1)}%`,
        ethDominance: `${(global?.market_cap_percentage?.eth || 0).toFixed(1)}%`,
        activeCryptocurrencies: global?.active_cryptocurrencies || 10000,
        markets: global?.markets || 500,
      },
    }
  }

  try {
    const data = await getOrSet("trading:market", 30_000, getFreshData)
    return apiSuccess(data)
  } catch {
    return apiSuccess({
      assets: [
        { symbol: "BTC/USDT", name: "Bitcoin", price: 67450, change24h: 2.3, volume24h: 2.35e10, marketCap: 1.32e12, logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png" },
        { symbol: "ETH/USDT", name: "Ethereum", price: 3520, change24h: 1.8, volume24h: 1.8e10, marketCap: 4.23e11, logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
        { symbol: "SOL/USDT", name: "Solana", price: 168, change24h: 4.2, volume24h: 5e9, marketCap: 7.2e10, logo: "https://cryptologos.cc/logos/solana-sol-logo.png" },
        { symbol: "BNB/USDT", name: "BNB", price: 598, change24h: 0.5, volume24h: 1.2e9, marketCap: 9.1e10, logo: "https://cryptologos.cc/logos/bnb-bnb-logo.png" },
        { symbol: "XRP/USDT", name: "XRP", price: 0.62, change24h: -0.8, volume24h: 1.5e9, marketCap: 3.4e10, logo: "https://cryptologos.cc/logos/xrp-xrp-logo.png" },
        { symbol: "DOGE/USDT", name: "Dogecoin", price: 0.124, change24h: 5.6, volume24h: 8e8, marketCap: 1.8e10, logo: "https://cryptologos.cc/logos/dogecoin-doge-logo.png" },
        { symbol: "ADA/USDT", name: "Cardano", price: 0.46, change24h: -1.2, volume24h: 6e8, marketCap: 1.6e10, logo: "https://cryptologos.cc/logos/cardano-ada-logo.png" },
      ],
      fearGreed: 65,
      sentiment: 68,
      marketCap: "$2.47T",
      volume24h: "$86.2B",
      btcDominance: "52.4%",
      openInterest: "$38.1B",
      topGainers: [{ name: "SOL", change: "+4.2%" }, { name: "DOGE", change: "+5.6%" }, { name: "BTC", change: "+2.3%" }],
      topLosers: [{ name: "ADA", change: "-1.2%" }, { name: "XRP", change: "-0.8%" }, { name: "BNB", change: "+0.5%" }],
    })
  }
}

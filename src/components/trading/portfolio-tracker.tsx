"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, TrendingUp, TrendingDown, Trash2, Wallet, X } from "lucide-react"

interface Holding {
  id: string
  symbol: string
  entryPrice: number
  amount: number
  addedAt: string
}

interface AssetData {
  symbol: string
  name: string
  price: number
  change24h: number
}

export function PortfolioTracker({ allAssets }: { allAssets: AssetData[] }) {
  const [holdings, setHoldings] = useState<Holding[]>(() => {
    try {
      const saved = localStorage.getItem("aiverse_portfolio")
      if (saved) return JSON.parse(saved)
    } catch {}
    return []
  })
  const [open, setOpen] = useState(false)
  const [newSymbol, setNewSymbol] = useState("BTC")
  const [newEntry, setNewEntry] = useState("")
  const [newAmount, setNewAmount] = useState("")

  useEffect(() => {
    localStorage.setItem("aiverse_portfolio", JSON.stringify(holdings))
  }, [holdings])

  function addHolding() {
    if (!newSymbol || !newEntry || !newAmount) return
    setHoldings((prev) => [
      ...prev,
      { id: Date.now().toString(), symbol: newSymbol.toUpperCase(), entryPrice: parseFloat(newEntry), amount: parseFloat(newAmount), addedAt: new Date().toISOString() },
    ])
    setNewEntry("")
    setNewAmount("")
    setOpen(false)
  }

  function removeHolding(id: string) {
    setHoldings((prev) => prev.filter((h) => h.id !== id))
  }

  const totalValue = holdings.reduce((sum, h) => {
    const asset = allAssets.find((a) => a.symbol.replace("/", "").replace("USDT", "") === h.symbol)
    return sum + (asset?.price || 0) * h.amount
  }, 0)

  const totalCost = holdings.reduce((sum, h) => sum + h.entryPrice * h.amount, 0)
  const totalPnL = totalValue - totalCost
  const pnlPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            Portfolio
            {holdings.length > 0 && (
              <div className="flex items-center gap-3 text-sm font-normal">
                <span className="text-muted-foreground">${totalValue.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                <span className={totalPnL >= 0 ? "text-emerald-500" : "text-red-500"}>
                  {totalPnL >= 0 ? "+" : ""}${totalPnL.toLocaleString(undefined, {maximumFractionDigits: 2})} ({pnlPercent >= 0 ? "+" : ""}{pnlPercent.toFixed(1)}%)
                </span>
              </div>
            )}
          </CardTitle>
          <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add Position
          </Button>
          {open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
              <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Add Portfolio Position</h3>
                  <button onClick={() => setOpen(false)}><X className="h-4 w-4" /></button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Coin</label>
                    <select value={newSymbol} onChange={(e) => setNewSymbol(e.target.value)} className="w-full h-9 rounded-lg border border-input bg-background px-2 text-sm">
                      {allAssets.slice(0, 20).map((a) => (
                        <option key={a.symbol} value={a.symbol.replace("/", "").replace("USDT", "")}>{a.name} ({a.symbol})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Entry Price ($)</label>
                    <Input type="number" step="any" value={newEntry} onChange={(e) => setNewEntry(e.target.value)} placeholder="e.g. 45000" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Amount</label>
                    <Input type="number" step="any" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="e.g. 0.5" />
                  </div>
                  <Button onClick={addHolding} className="w-full" disabled={!newEntry || !newAmount}>Add to Portfolio</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {holdings.length === 0 ? (
          <div className="text-center py-6">
            <Wallet className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Track your crypto portfolio. Add positions with entry price and amount.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {holdings.map((h) => {
              const asset = allAssets.find((a) => a.symbol.replace("/", "").replace("USDT", "") === h.symbol)
              const currentPrice = asset?.price || 0
              const value = currentPrice * h.amount
              const cost = h.entryPrice * h.amount
              const pnl = value - cost
              const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0
              const allocation = totalValue > 0 ? (value / totalValue) * 100 : 0

              return (
                <div key={h.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-secondary text-xs font-bold">
                      {h.symbol.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{h.symbol}</p>
                      <p className="text-[10px] text-muted-foreground">{h.amount} @ ${h.entryPrice.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold">${value.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                      <p className={`text-[10px] font-medium flex items-center gap-0.5 justify-end ${pnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {pnl >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                        {pnl >= 0 ? "+" : ""}${pnl.toLocaleString(undefined, {maximumFractionDigits: 2})} ({pnlPct.toFixed(1)}%)
                      </p>
                    </div>
                    <div className="text-right w-12">
                      <p className="text-[10px] text-muted-foreground">{allocation.toFixed(1)}%</p>
                    </div>
                    <button onClick={() => removeHolding(h.id)} className="p-1 rounded hover:bg-destructive/10 transition-colors" aria-label="Remove">
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

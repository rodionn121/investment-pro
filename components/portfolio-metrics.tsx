"use client"

import type { Asset } from "@/lib/portfolio"
import { TrendingUp, TrendingDown, Target } from "lucide-react"

interface PortfolioMetricsProps {
  assets: Asset[]
}

export function PortfolioMetrics({ assets }: PortfolioMetricsProps) {
  const totalInvested = assets.reduce((sum, asset) => sum + asset.purchase_price * asset.quantity, 0)
  const totalCurrent = assets.reduce((sum, asset) => sum + asset.current_price * asset.quantity, 0)
  const totalGainLoss = totalCurrent - totalInvested
  const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0

  const topGainer = assets.reduce((max, asset) => {
    const gain = ((asset.current_price - asset.purchase_price) / asset.purchase_price) * 100
    const maxGain = ((max.current_price - max.purchase_price) / max.purchase_price) * 100
    return gain > maxGain ? asset : max
  }, assets[0])

  const topLoser = assets.reduce((min, asset) => {
    const loss = ((asset.current_price - asset.purchase_price) / asset.purchase_price) * 100
    const minLoss = ((min.current_price - min.purchase_price) / min.purchase_price) * 100
    return loss < minLoss ? asset : min
  }, assets[0])

  const avgPerformance = totalGainLossPercent / assets.length

  if (assets.length === 0) return null

  return (
    <section className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Top Gainer */}
      <div className="bg-card border border-border rounded-xl p-5 hover:border-success/30 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-xs font-semibold text-muted-foreground uppercase">Maior Alta</span>
          </div>
        </div>
        <p className="text-2xl font-bold mb-2">{topGainer.ticker}</p>
        <p className="text-sm text-muted-foreground">{topGainer.quantity} ações</p>
        <div className="mt-4 pt-3 border-t border-border/40">
          <p className="text-success font-semibold">
            +{(((topGainer.current_price - topGainer.purchase_price) / topGainer.purchase_price) * 100).toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Top Loser */}
      <div className="bg-card border border-border rounded-xl p-5 hover:border-danger/30 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-danger" />
            <span className="text-xs font-semibold text-muted-foreground uppercase">Maior Queda</span>
          </div>
        </div>
        <p className="text-2xl font-bold mb-2">{topLoser.ticker}</p>
        <p className="text-sm text-muted-foreground">{topLoser.quantity} ações</p>
        <div className="mt-4 pt-3 border-t border-border/40">
          <p className="text-danger font-semibold">
            {(((topLoser.current_price - topLoser.purchase_price) / topLoser.purchase_price) * 100).toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Average Performance */}
      <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground uppercase">Performance Média</span>
          </div>
        </div>
        <p className="text-2xl font-bold mb-2">
          {avgPerformance >= 0 ? "+" : ""}
          {avgPerformance.toFixed(2)}%
        </p>
        <p className="text-sm text-muted-foreground">{assets.length} ativos</p>
        <div className="mt-4 pt-3 border-t border-border/40">
          <p className={`font-semibold ${avgPerformance >= 0 ? "text-success" : "text-danger"}`}>
            R$ {(totalGainLoss / assets.length).toFixed(2).replace(".", ",")}
          </p>
        </div>
      </div>
    </section>
  )
}

"use client"

import { Card } from "@/components/ui/card"
import type { Asset } from "@/lib/portfolio"
import { TrendingUp, TrendingDown, Wallet, DollarSign } from "lucide-react"

interface DashboardStatsProps {
  assets: Asset[]
}

export function DashboardStats({ assets }: DashboardStatsProps) {
  const totalInvested = assets.reduce((sum, asset) => {
    return sum + asset.purchase_price * asset.quantity
  }, 0)

  const currentValue = assets.reduce((sum, asset) => {
    return sum + asset.current_price * asset.quantity
  }, 0)

  const gainLoss = currentValue - totalInvested
  const gainLossPercent = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0
  const isPositive = gainLoss >= 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Investido */}
      <Card className="p-6 border-border/50 hover:shadow-md hover:border-primary/30 transition-all duration-300">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 rounded-xl p-3">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Investido</p>
            <p className="text-3xl font-bold mt-3 text-foreground">R$ {totalInvested.toFixed(2).replace(".", ",")}</p>
            <p className="text-xs text-muted-foreground mt-2 font-medium">Valor total aplicado</p>
          </div>
        </div>
      </Card>

      {/* Valor Atual */}
      <Card className="p-6 border-border/50 hover:shadow-md hover:border-primary/30 transition-all duration-300">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 rounded-xl p-3">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Valor Atual</p>
            <p className="text-3xl font-bold mt-3 text-foreground">R$ {currentValue.toFixed(2).replace(".", ",")}</p>
            <p className="text-xs text-muted-foreground mt-2 font-medium">Cotação do mercado</p>
          </div>
        </div>
      </Card>

      {/* Ganho/Perda */}
      <Card
        className={`p-6 border-border/50 hover:shadow-md transition-all duration-300 ${
          isPositive
            ? "bg-success/5 border-success/20 hover:border-success/40"
            : "bg-danger/5 border-danger/20 hover:border-danger/40"
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`${isPositive ? "bg-success/10" : "bg-danger/10"} rounded-xl p-3`}>
            {isPositive ? (
              <TrendingUp className="h-6 w-6 text-success" />
            ) : (
              <TrendingDown className="h-6 w-6 text-danger" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ganho/Perda</p>
            <p className={`text-3xl font-bold mt-3 ${isPositive ? "text-success" : "text-danger"}`}>
              {isPositive ? "+" : ""}R$ {gainLoss.toFixed(2).replace(".", ",")}
            </p>
            <p className={`text-xs mt-2 font-semibold ${isPositive ? "text-success" : "text-danger"}`}>
              {gainLossPercent.toFixed(2).replace(".", ",")}%
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

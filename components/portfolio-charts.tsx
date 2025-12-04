"use client"

import type { Asset } from "@/lib/portfolio"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

interface PortfolioChartsProps {
  assets: Asset[]
}

export function PortfolioCharts({ assets }: PortfolioChartsProps) {
  const uniqueAssets = assets.reduce((acc, asset) => {
    const existing = acc.find((a) => a.ticker === asset.ticker)
    if (existing) {
      existing.quantity += asset.quantity
      existing.current_price = asset.current_price
    } else {
      acc.push({ ...asset })
    }
    return acc
  }, [] as Asset[])

  const colors = [
    "#3b82f6", // blue
    "#10b981", // green
    "#ef4444", // red
    "#f59e0b", // amber
    "#8b5cf6", // purple
    "#06b6d4", // cyan
    "#ec4899", // pink
    "#6366f1", // indigo
    "#14b8a6", // teal
    "#f97316", // orange
  ]

  const allocationData = uniqueAssets.map((asset, index) => {
    const value = asset.current_price * asset.quantity
    return {
      name: asset.ticker,
      value: value,
      fill: colors[index % colors.length],
    }
  })

  const totalValue = allocationData.reduce((sum, item) => sum + item.value, 0)

  if (uniqueAssets.length === 0) {
    return null
  }

  return (
    <section className="mt-12">
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-6">Distribuição da Carteira</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={(entry) => `${entry.name}`}
                  outerRadius={110}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="white" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                  labelStyle={{ color: "var(--foreground)" }}
                  formatter={(value) => `R$ ${(value as number).toFixed(2).replace(".", ",")}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">Composição</h4>
            {allocationData.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border border-white/40" style={{ backgroundColor: item.fill }} />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">R$ {item.value.toFixed(2).replace(".", ",")}</p>
                  <p className="text-xs text-muted-foreground">{((item.value / totalValue) * 100).toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

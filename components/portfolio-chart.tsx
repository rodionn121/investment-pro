"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, PieChartIcon } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface PortfolioAsset {
  id: number
  ticker: string
  quantity: number
  purchase_price: number
  current_price: number
  total_purchase_value: number
  current_value: number
  gain_loss: number
  gain_loss_percentage: number
}

interface PortfolioChartProps {
  assets: PortfolioAsset[]
}

const CHART_COLORS = [
  "#3b82f6", // Azul
  "#10b981", // Verde
  "#f59e0b", // Laranja
  "#8b5cf6", // Roxo
  "#ef4444", // Vermelho
  "#06b6d4", // Ciano
  "#ec4899", // Rosa
  "#84cc16", // Lima
  "#f97316", // Laranja escuro
  "#6366f1", // Índigo
  "#14b8a6", // Teal
  "#f43f5e", // Rosa escuro
  "#a855f7", // Roxo escuro
  "#22c55e", // Verde claro
  "#eab308", // Amarelo
  "#64748b", // Cinza azulado
  "#0ea5e9", // Azul claro
  "#d946ef", // Fúcsia
  "#fb923c", // Laranja coral
  "#4ade80", // Verde neon
]

export default function PortfolioChart({ assets }: PortfolioChartProps) {
  if (!assets || assets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição da Carteira</CardTitle>
          <CardDescription>Visualize a composição dos seus investimentos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <PieChartIcon className="h-12 w-12 mb-4" />
            <p>Adicione ativos para visualizar a distribuição</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Preparar dados para o gráfico
  const chartData = assets.map((asset, index) => ({
    name: asset.ticker,
    value: asset.current_value,
    percentage: 0,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }))

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0)

  // Calcular percentuais
  chartData.forEach((item) => {
    item.percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0
  })

  // Ordenar por valor (maior primeiro)
  chartData.sort((a, b) => b.value - a.value)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-1">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(data.value)}
          </p>
          <p className="text-sm font-medium mt-1">{data.percentage.toFixed(2)}%</p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{entry.payload.name}</p>
              <p className="text-xs text-muted-foreground">{entry.payload.percentage.toFixed(1)}%</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Distribuição da Carteira</CardTitle>
            <CardDescription>Composição dos seus investimentos por ativo</CardDescription>
          </div>
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Top performers */}
          <div className="mt-8 pt-6 border-t">
            <h4 className="text-sm font-semibold mb-4">Maiores Posições</h4>
            <div className="space-y-3">
              {chartData.slice(0, 3).map((item, index) => {
                const asset = assets.find((a) => a.ticker === item.name)
                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.percentage.toFixed(2)}% da carteira</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(item.value)}
                      </p>
                      {asset && (
                        <p
                          className={`text-xs font-medium ${asset.gain_loss >= 0 ? "text-success" : "text-destructive"}`}
                        >
                          {asset.gain_loss >= 0 ? "+" : ""}
                          {asset.gain_loss_percentage.toFixed(2)}%
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
